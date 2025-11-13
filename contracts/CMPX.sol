// SPDX-License-Identifier: MIT
// ComplicesConecta v3.7.0 - Token CMPX (Utility)
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Token ERC-20 upgradeable con seguridad extrema para ComplicesConecta
// Funcionalidades: ReentrancyGuard, blacklist, max supply, mint controlado

pragma solidity ^0.8.25;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title CMPX Token - ComplicesConecta Utility Token
 * @dev Token ERC-20 para el ecosistema ComplicesConecta
 * @notice Token principal para mint de NFTs, staking y economía interna
 * 
 * Características principales:
 * - Supply máximo: 1,000,000,000 CMPX (1B)
 * - Upgradeable para futuras mejoras
 * - Sistema de blacklist para seguridad
 * - ReentrancyGuard para prevenir ataques
 * - Pausable para emergencias
 * - Mint controlado solo por owner
 */
contract CMPX is 
    Initializable,
    ERC20Upgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    /// @notice Supply máximo de tokens CMPX (1.25 billones - incluye 25% para testing)
    uint256 public constant MAX_SUPPLY = 1_250_000_000 * 10**18;
    
    /// @notice Mapping de direcciones en blacklist
    mapping(address => bool) public blacklisted;
    
    /// @notice Mapping de direcciones autorizadas para mint
    mapping(address => bool) public minters;
    
    /// @notice Total de tokens mintados hasta ahora
    uint256 public totalMinted;
    
    /// @notice Indica si el contrato está en modo testnet
    bool public isTestnet;
    
    /// @notice Pool de tokens para testing (25% del supply)
    uint256 public constant TESTNET_POOL = 250_000_000 * 10**18;
    
    /// @notice Tokens distribuidos para testing
    uint256 public testnetTokensDistributed;
    
    /// @notice Límite de tokens gratuitos por usuario en testnet
    uint256 public constant TESTNET_FREE_LIMIT = 1000 * 10**18; // 1000 CMPX por usuario
    
    /// @notice Límite diario del 1% del pool de testnet por usuario registrado
    uint256 public constant DAILY_CLAIM_LIMIT = TESTNET_POOL / 100; // 1% del pool = 2.5M CMPX
    
    /// @notice Mapping de tokens gratuitos reclamados por usuario en testnet
    mapping(address => uint256) public testnetTokensClaimed;
    
    /// @notice Mapping de último reclamo diario por usuario
    mapping(address => uint256) public lastDailyClaim;
    
    /// @notice Mapping de tokens reclamados hoy por usuario
    mapping(address => uint256) public dailyTokensClaimed;
    
    // Eventos personalizados
    event AddressBlacklisted(address indexed account, bool status);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TestnetTokensClaimed(address indexed user, uint256 amount);
    event DailyTokensClaimed(address indexed user, uint256 amount, uint256 day);
    event TestnetModeToggled(bool isTestnet);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Inicializa el contrato CMPX
     * @param initialOwner Dirección del propietario inicial
     * @param _isTestnet Si el contrato está en modo testnet
     */
    function initialize(address initialOwner, bool _isTestnet) external initializer {
        require(initialOwner != address(0), "CMPX: Owner cannot be zero address");
        
        __ERC20_init("ComplicesConecta CMPX", "CMPX");
        __Ownable_init();
        _transferOwnership(initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        
        // Configurar modo testnet
        isTestnet = _isTestnet;
        
        // Mint inicial al owner (distribución según tokenomics)
        uint256 initialMint = MAX_SUPPLY * 60 / 100; // 60% para distribución inicial
        _mint(initialOwner, initialMint);
        totalMinted = initialMint;
        
        emit TokensMinted(initialOwner, initialMint, "Initial distribution");
        emit TestnetModeToggled(_isTestnet);
    }
    
    /**
     * @notice Transfiere tokens con verificaciones de seguridad
     * @param to Dirección destino
     * @param amount Cantidad a transferir
     * @return bool Éxito de la operación
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        require(!blacklisted[msg.sender], "CMPX: Sender is blacklisted");
        require(!blacklisted[to], "CMPX: Recipient is blacklisted");
        require(to != address(0), "CMPX: Transfer to zero address");
        
        return super.transfer(to, amount);
    }
    
    /**
     * @notice Transfiere tokens desde una dirección con verificaciones de seguridad
     * @param from Dirección origen
     * @param to Dirección destino
     * @param amount Cantidad a transferir
     * @return bool Éxito de la operación
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        require(!blacklisted[from], "CMPX: From address is blacklisted");
        require(!blacklisted[to], "CMPX: To address is blacklisted");
        require(to != address(0), "CMPX: Transfer to zero address");
        
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @notice Mintea tokens nuevos (solo minters autorizados)
     * @param to Dirección destino
     * @param amount Cantidad a mintear
     * @param reason Razón del mint para auditoría
     */
    function mint(address to, uint256 amount, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(minters[msg.sender] || msg.sender == owner(), "CMPX: Not authorized to mint");
        require(to != address(0), "CMPX: Mint to zero address");
        require(!blacklisted[to], "CMPX: Cannot mint to blacklisted address");
        require(totalMinted + amount <= MAX_SUPPLY, "CMPX: Exceeds max supply");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @notice Mintea tokens para conversión de Tokens Premium (solo owner)
     * @param user Dirección del usuario
     * @param tpAmount Cantidad de Tokens Premium a convertir
     */
    function mintForPremium(address user, uint256 tpAmount) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(user != address(0), "CMPX: User cannot be zero address");
        require(!blacklisted[user], "CMPX: User is blacklisted");
        require(tpAmount >= 1000, "CMPX: Minimum 1000 TP required");
        
        uint256 cmpxAmount = tpAmount / 10; // 10 TP = 1 CMPX
        require(totalMinted + cmpxAmount <= MAX_SUPPLY, "CMPX: Exceeds max supply");
        
        _mint(user, cmpxAmount);
        totalMinted += cmpxAmount;
        
        emit TokensMinted(user, cmpxAmount, "Premium conversion");
    }
    
    /**
     * @notice Añade o remueve una dirección de la blacklist (solo owner)
     * @param account Dirección a modificar
     * @param status true para blacklist, false para remover
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        require(account != address(0), "CMPX: Cannot blacklist zero address");
        require(account != owner(), "CMPX: Cannot blacklist owner");
        
        blacklisted[account] = status;
        emit AddressBlacklisted(account, status);
    }
    
    /**
     * @notice Añade un minter autorizado (solo owner)
     * @param minter Dirección del nuevo minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "CMPX: Minter cannot be zero address");
        require(!minters[minter], "CMPX: Already a minter");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @notice Remueve un minter autorizado (solo owner)
     * @param minter Dirección del minter a remover
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "CMPX: Not a minter");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
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
     * @notice Reclama tokens gratuitos para testnet (solo en testnet)
     * @param amount Cantidad de tokens a reclamar (máximo TESTNET_FREE_LIMIT)
     */
    function claimTestnetTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(isTestnet, "CMPX: Not in testnet mode");
        require(amount > 0, "CMPX: Amount must be greater than 0");
        require(!blacklisted[msg.sender], "CMPX: Address is blacklisted");
        
        uint256 alreadyClaimed = testnetTokensClaimed[msg.sender];
        require(alreadyClaimed + amount <= TESTNET_FREE_LIMIT, "CMPX: Exceeds testnet limit per user");
        require(testnetTokensDistributed + amount <= TESTNET_POOL, "CMPX: Exceeds testnet pool");
        require(totalMinted + amount <= MAX_SUPPLY, "CMPX: Exceeds max supply");
        
        // Actualizar contadores
        testnetTokensClaimed[msg.sender] = alreadyClaimed + amount;
        testnetTokensDistributed += amount;
        totalMinted += amount;
        
        // Mintear tokens
        _mint(msg.sender, amount);
        
        emit TestnetTokensClaimed(msg.sender, amount);
        emit TokensMinted(msg.sender, amount, "Testnet claim");
    }
    
    /**
     * @notice Reclama tokens diarios para usuarios registrados (1% del pool por día)
     * @param amount Cantidad de tokens a reclamar (máximo DAILY_CLAIM_LIMIT)
     */
    function claimDailyTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(isTestnet, "CMPX: Not in testnet mode");
        require(amount > 0, "CMPX: Amount must be greater than 0");
        require(!blacklisted[msg.sender], "CMPX: Address is blacklisted");
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastClaimDay = lastDailyClaim[msg.sender];
        
        // Verificar si es un nuevo día
        if (currentDay > lastClaimDay) {
            // Resetear contador diario
            dailyTokensClaimed[msg.sender] = 0;
            lastDailyClaim[msg.sender] = currentDay;
        }
        
        uint256 alreadyClaimedToday = dailyTokensClaimed[msg.sender];
        require(alreadyClaimedToday + amount <= DAILY_CLAIM_LIMIT, "CMPX: Exceeds daily limit per user");
        require(testnetTokensDistributed + amount <= TESTNET_POOL, "CMPX: Exceeds testnet pool");
        require(totalMinted + amount <= MAX_SUPPLY, "CMPX: Exceeds max supply");
        
        // Actualizar contadores
        dailyTokensClaimed[msg.sender] = alreadyClaimedToday + amount;
        testnetTokensDistributed += amount;
        totalMinted += amount;
        
        // Mintear tokens
        _mint(msg.sender, amount);
        
        emit DailyTokensClaimed(msg.sender, amount, currentDay);
        emit TokensMinted(msg.sender, amount, "Daily claim");
    }
    
    /**
     * @notice Cambia el modo testnet (solo owner)
     * @param _isTestnet Nuevo estado del modo testnet
     */
    function setTestnetMode(bool _isTestnet) external onlyOwner {
        isTestnet = _isTestnet;
        emit TestnetModeToggled(_isTestnet);
    }
    
    /**
     * @notice Mintea tokens de prueba para demos (solo en testnet, solo owner)
     * @param to Dirección destino
     * @param amount Cantidad a mintear
     */
    function mintTestnetTokens(address to, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        require(isTestnet, "CMPX: Not in testnet mode");
        require(to != address(0), "CMPX: Cannot mint to zero address");
        require(!blacklisted[to], "CMPX: Cannot mint to blacklisted address");
        require(testnetTokensDistributed + amount <= TESTNET_POOL, "CMPX: Exceeds testnet pool");
        require(totalMinted + amount <= MAX_SUPPLY, "CMPX: Exceeds max supply");
        
        testnetTokensDistributed += amount;
        totalMinted += amount;
        
        _mint(to, amount);
        
        emit TokensMinted(to, amount, "Testnet mint by owner");
    }
    
    /**
     * @notice Retorna la cantidad de tokens disponibles para mint
     * @return uint256 Tokens disponibles
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }
    
    /**
     * @notice Verifica si una dirección está en blacklist
     * @param account Dirección a verificar
     * @return bool true si está en blacklist
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }
    
    /**
     * @notice Verifica si una dirección es minter autorizado
     * @param account Dirección a verificar
     * @return bool true si es minter autorizado
     */
    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }
    
    /**
     * @notice Retorna información de testnet para un usuario
     * @param user Dirección del usuario
     * @return claimed Tokens ya reclamados (gratuitos)
     * @return remaining Tokens restantes que puede reclamar (gratuitos)
     * @return dailyClaimed Tokens reclamados hoy (diarios)
     * @return dailyRemaining Tokens restantes hoy (diarios)
     * @return poolRemaining Tokens restantes en el pool de testnet
     */
    function getTestnetInfo(address user) external view returns (
        uint256 claimed,
        uint256 remaining,
        uint256 dailyClaimed,
        uint256 dailyRemaining,
        uint256 poolRemaining
    ) {
        claimed = testnetTokensClaimed[user];
        remaining = TESTNET_FREE_LIMIT > claimed ? TESTNET_FREE_LIMIT - claimed : 0;
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastClaimDay = lastDailyClaim[user];
        
        if (currentDay > lastClaimDay) {
            // Nuevo día, puede reclamar el límite completo
            dailyClaimed = 0;
            dailyRemaining = DAILY_CLAIM_LIMIT;
        } else {
            // Mismo día, verificar lo ya reclamado
            dailyClaimed = dailyTokensClaimed[user];
            dailyRemaining = DAILY_CLAIM_LIMIT > dailyClaimed ? DAILY_CLAIM_LIMIT - dailyClaimed : 0;
        }
        
        poolRemaining = TESTNET_POOL > testnetTokensDistributed ? TESTNET_POOL - testnetTokensDistributed : 0;
    }
    
    /**
     * @notice Retorna estadísticas generales de testnet
     * @return isTestnetActive Si el modo testnet está activo
     * @return totalDistributed Total de tokens distribuidos en testnet
     * @return poolRemaining Tokens restantes en el pool
     * @return freeLimit Límite de tokens gratuitos por usuario
     * @return dailyLimit Límite diario por usuario registrado (1% del pool)
     */
    function getTestnetStats() external view returns (
        bool isTestnetActive,
        uint256 totalDistributed,
        uint256 poolRemaining,
        uint256 freeLimit,
        uint256 dailyLimit
    ) {
        isTestnetActive = isTestnet;
        totalDistributed = testnetTokensDistributed;
        poolRemaining = TESTNET_POOL > testnetTokensDistributed ? TESTNET_POOL - testnetTokensDistributed : 0;
        freeLimit = TESTNET_FREE_LIMIT;
        dailyLimit = DAILY_CLAIM_LIMIT;
    }
}
