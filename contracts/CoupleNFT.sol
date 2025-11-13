// SPDX-License-Identifier: MIT
// ComplicesConecta v3.7.0 - CoupleNFT (ERC-721 con Consentimiento Doble)
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: NFT ERC-721 para parejas con sistema de consentimiento doble obligatorio
// Funcionalidades: Dual mint, consentimiento doble, seguridad extrema, timeout

pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CoupleNFT - NFT para Parejas con Consentimiento Doble
 * @dev Contrato ERC-721 que requiere consentimiento de ambas partes para mint
 * @notice Sistema de NFTs para parejas con verificación de consentimiento doble
 * 
 * Características principales:
 * - Consentimiento doble obligatorio
 * - Timeout de 24 horas para aprobación
 * - Dual mint (ambos reciben NFT)
 * - Sistema de cancelación
 * - Blacklist integrada
 * - Metadata IPFS
 */
contract CoupleNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    /// @notice Contador de token IDs
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Timeout para aprobación de consentimiento (24 horas)
    uint256 public constant CONSENT_TIMEOUT = 24 hours;
    
    /// @notice Costo de mint en CMPX tokens
    uint256 public mintCost = 200 * 10**18; // 200 CMPX
    
    /// @notice Dirección del contrato CMPX
    address public cmpxToken;
    
    /**
     * @dev Estructura para almacenar información de consentimiento de pareja
     */
    struct CoupleConsent {
        address partner1;           // Primera pareja
        address partner2;           // Segunda pareja
        uint256 consentTimestamp1;  // Timestamp de consentimiento partner1
        uint256 consentTimestamp2;  // Timestamp de consentimiento partner2
        uint256 requestTimestamp;   // Timestamp de solicitud inicial
        string tokenURI;            // URI del metadata IPFS
        bool isActive;              // Estado activo de la solicitud
        bool isMinted;              // Si ya fue minteado
        address initiator;          // Quien inició la solicitud
    }
    
    /// @notice Mapping de consentimientos por token ID
    mapping(uint256 => CoupleConsent) public coupleConsents;
    
    /// @notice Mapping de direcciones en blacklist
    mapping(address => bool) public blacklisted;
    
    /// @notice Mapping de solicitudes pendientes por usuario
    mapping(address => uint256[]) public pendingRequests;
    
    /// @notice Mapping de NFTs por pareja (para evitar duplicados)
    mapping(bytes32 => bool) public coupleExists;
    
    // Eventos personalizados
    event CoupleRequestCreated(
        uint256 indexed tokenId,
        address indexed partner1,
        address indexed partner2,
        address initiator,
        uint256 timestamp
    );
    
    event ConsentGiven(
        uint256 indexed tokenId,
        address indexed partner,
        uint256 timestamp
    );
    
    event CoupleNFTMinted(
        uint256 indexed tokenId1,
        uint256 indexed tokenId2,
        address indexed partner1,
        address indexed partner2,
        string tokenURI
    );
    
    event RequestCancelled(
        uint256 indexed tokenId,
        address indexed canceller,
        string reason
    );
    
    event AddressBlacklisted(address indexed account, bool status);
    
    /**
     * @notice Constructor del contrato CoupleNFT
     * @param _cmpxToken Dirección del contrato CMPX
     */
    constructor(address _cmpxToken) 
        ERC721("ComplicesConecta Couple NFT", "CCNFT") 
        Ownable(msg.sender) 
    {
        require(_cmpxToken != address(0), "CoupleNFT: CMPX token cannot be zero address");
        cmpxToken = _cmpxToken;
    }
    
    /**
     * @notice Solicita mint de NFT para pareja
     * @param partner1 Dirección de la primera pareja
     * @param partner2 Dirección de la segunda pareja
     * @param tokenURI URI del metadata IPFS
     * @return uint256 Token ID de la solicitud
     */
    function requestCoupleMint(
        address partner1,
        address partner2,
        string memory tokenURI
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(partner1 != address(0) && partner2 != address(0), "CoupleNFT: Partners cannot be zero address");
        require(partner1 != partner2, "CoupleNFT: Partners must be different");
        require(msg.sender == partner1 || msg.sender == partner2, "CoupleNFT: Caller must be one of the partners");
        require(!blacklisted[partner1] && !blacklisted[partner2], "CoupleNFT: One or both partners are blacklisted");
        require(bytes(tokenURI).length > 0, "CoupleNFT: Token URI cannot be empty");
        
        // Verificar que la pareja no tenga ya un NFT
        bytes32 coupleHash = keccak256(abi.encodePacked(
            partner1 < partner2 ? partner1 : partner2,
            partner1 < partner2 ? partner2 : partner1
        ));
        require(!coupleExists[coupleHash], "CoupleNFT: Couple already has an NFT");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Crear solicitud de consentimiento
        coupleConsents[tokenId] = CoupleConsent({
            partner1: partner1,
            partner2: partner2,
            consentTimestamp1: msg.sender == partner1 ? block.timestamp : 0,
            consentTimestamp2: msg.sender == partner2 ? block.timestamp : 0,
            requestTimestamp: block.timestamp,
            tokenURI: tokenURI,
            isActive: true,
            isMinted: false,
            initiator: msg.sender
        });
        
        // Añadir a solicitudes pendientes
        pendingRequests[partner1].push(tokenId);
        pendingRequests[partner2].push(tokenId);
        
        emit CoupleRequestCreated(tokenId, partner1, partner2, msg.sender, block.timestamp);
        
        return tokenId;
    }
    
    /**
     * @notice Aprueba mint de NFT para pareja
     * @param tokenId ID del token a aprobar
     */
    function approveCoupleMint(uint256 tokenId) external nonReentrant whenNotPaused {
        CoupleConsent storage consent = coupleConsents[tokenId];
        
        require(consent.isActive, "CoupleNFT: Request is not active");
        require(!consent.isMinted, "CoupleNFT: Already minted");
        require(msg.sender == consent.partner1 || msg.sender == consent.partner2, "CoupleNFT: Not authorized");
        require(!blacklisted[msg.sender], "CoupleNFT: Caller is blacklisted");
        require(block.timestamp <= consent.requestTimestamp + CONSENT_TIMEOUT, "CoupleNFT: Request expired");
        
        // Registrar consentimiento
        if (msg.sender == consent.partner1 && consent.consentTimestamp1 == 0) {
            consent.consentTimestamp1 = block.timestamp;
            emit ConsentGiven(tokenId, msg.sender, block.timestamp);
        } else if (msg.sender == consent.partner2 && consent.consentTimestamp2 == 0) {
            consent.consentTimestamp2 = block.timestamp;
            emit ConsentGiven(tokenId, msg.sender, block.timestamp);
        } else {
            revert("CoupleNFT: Already consented or not authorized");
        }
        
        // Si ambos han dado consentimiento, proceder con el mint
        if (consent.consentTimestamp1 > 0 && consent.consentTimestamp2 > 0) {
            _executeDualMint(tokenId);
        }
    }
    
    /**
     * @notice Ejecuta el mint dual para la pareja
     * @param tokenId ID del token base
     */
    function _executeDualMint(uint256 tokenId) internal {
        CoupleConsent storage consent = coupleConsents[tokenId];
        
        // Verificar pago en CMPX tokens
        require(_verifyPayment(consent.partner1, consent.partner2), "CoupleNFT: Insufficient CMPX balance");
        
        // Mint dual NFT
        uint256 tokenId2 = _tokenIdCounter.current() + 1;
        _tokenIdCounter.increment();
        
        _safeMint(consent.partner1, tokenId);
        _safeMint(consent.partner2, tokenId2);
        
        _setTokenURI(tokenId, consent.tokenURI);
        _setTokenURI(tokenId2, consent.tokenURI);
        
        // Marcar como minteado
        consent.isMinted = true;
        consent.isActive = false;
        
        // Marcar pareja como existente
        bytes32 coupleHash = keccak256(abi.encodePacked(
            consent.partner1 < consent.partner2 ? consent.partner1 : consent.partner2,
            consent.partner1 < consent.partner2 ? consent.partner2 : consent.partner1
        ));
        coupleExists[coupleHash] = true;
        
        // Limpiar solicitudes pendientes
        _removePendingRequest(consent.partner1, tokenId);
        _removePendingRequest(consent.partner2, tokenId);
        
        emit CoupleNFTMinted(tokenId, tokenId2, consent.partner1, consent.partner2, consent.tokenURI);
    }
    
    /**
     * @notice Cancela una solicitud de mint
     * @param tokenId ID del token a cancelar
     * @param reason Razón de la cancelación
     */
    function cancelRequest(uint256 tokenId, string memory reason) external nonReentrant {
        CoupleConsent storage consent = coupleConsents[tokenId];
        
        require(consent.isActive, "CoupleNFT: Request is not active");
        require(!consent.isMinted, "CoupleNFT: Already minted");
        require(
            msg.sender == consent.partner1 || 
            msg.sender == consent.partner2 || 
            msg.sender == owner(),
            "CoupleNFT: Not authorized to cancel"
        );
        
        consent.isActive = false;
        
        // Limpiar solicitudes pendientes
        _removePendingRequest(consent.partner1, tokenId);
        _removePendingRequest(consent.partner2, tokenId);
        
        emit RequestCancelled(tokenId, msg.sender, reason);
    }
    
    /**
     * @notice Verifica el pago en tokens CMPX
     * @param partner1 Primera pareja
     * @param partner2 Segunda pareja
     * @return bool Si el pago es válido
     */
    function _verifyPayment(address partner1, address partner2) internal view returns (bool) {
        // Implementar verificación de balance CMPX
        // Por ahora retorna true para testnet
        return true;
    }
    
    /**
     * @notice Remueve una solicitud pendiente de la lista
     * @param user Usuario
     * @param tokenId Token ID a remover
     */
    function _removePendingRequest(address user, uint256 tokenId) internal {
        uint256[] storage requests = pendingRequests[user];
        for (uint256 i = 0; i < requests.length; i++) {
            if (requests[i] == tokenId) {
                requests[i] = requests[requests.length - 1];
                requests.pop();
                break;
            }
        }
    }
    
    /**
     * @notice Añade o remueve una dirección de la blacklist (solo owner)
     * @param account Dirección a modificar
     * @param status true para blacklist, false para remover
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        require(account != address(0), "CoupleNFT: Cannot blacklist zero address");
        require(account != owner(), "CoupleNFT: Cannot blacklist owner");
        
        blacklisted[account] = status;
        emit AddressBlacklisted(account, status);
    }
    
    /**
     * @notice Actualiza el costo de mint (solo owner)
     * @param newCost Nuevo costo en CMPX tokens
     */
    function setMintCost(uint256 newCost) external onlyOwner {
        require(newCost > 0, "CoupleNFT: Cost must be greater than 0");
        mintCost = newCost;
    }
    
    /**
     * @notice Pausa el contrato en caso de emergencia (solo owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Despausa el contrato (solo owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Limpia solicitudes expiradas
     * @param tokenIds Array de token IDs a limpiar
     */
    function cleanupExpiredRequests(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            CoupleConsent storage consent = coupleConsents[tokenId];
            
            if (consent.isActive && 
                !consent.isMinted && 
                block.timestamp > consent.requestTimestamp + CONSENT_TIMEOUT) {
                
                consent.isActive = false;
                _removePendingRequest(consent.partner1, tokenId);
                _removePendingRequest(consent.partner2, tokenId);
                
                emit RequestCancelled(tokenId, msg.sender, "Expired");
            }
        }
    }
    
    /**
     * @notice Retorna las solicitudes pendientes de un usuario
     * @param user Dirección del usuario
     * @return uint256[] Array de token IDs pendientes
     */
    function getPendingRequests(address user) external view returns (uint256[] memory) {
        return pendingRequests[user];
    }
    
    /**
     * @notice Verifica si una pareja ya tiene un NFT
     * @param partner1 Primera pareja
     * @param partner2 Segunda pareja
     * @return bool Si la pareja ya existe
     */
    function coupleHasNFT(address partner1, address partner2) external view returns (bool) {
        bytes32 coupleHash = keccak256(abi.encodePacked(
            partner1 < partner2 ? partner1 : partner2,
            partner1 < partner2 ? partner2 : partner1
        ));
        return coupleExists[coupleHash];
    }
    
    // Funciones requeridas por herencia múltiple
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
