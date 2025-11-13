// SPDX-License-Identifier: MIT
// ComplicesConecta v3.7.0 - StakingPool (NFT + Token Staking)
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Pool de staking para NFTs y tokens GTK con rewards en CMPX
// Funcionalidades: NFT staking, token staking, APY 10-20%, vesting, penalizaciones

pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title StakingPool - Pool de Staking para NFTs y Tokens
 * @dev Contrato para staking de NFTs y tokens GTK con rewards en CMPX
 * @notice Sistema de staking con vesting, APY variable y penalizaciones
 * 
 * Características principales:
 * - Staking de NFTs (ERC-721)
 * - Staking de tokens GTK (ERC-20)
 * - Rewards en tokens CMPX
 * - APY 10-20% según duración
 * - Vesting period mínimo 30 días
 * - Penalización por unstake temprano
 * - Boost por rareza de NFTs
 */
contract StakingPool is Ownable, ReentrancyGuard, Pausable, IERC721Receiver {
    using SafeMath for uint256;
    
    /// @notice Contrato de NFTs para staking
    IERC721 public nftContract;
    
    /// @notice Token GTK para staking
    IERC20 public gtkToken;
    
    /// @notice Token CMPX para rewards
    IERC20 public cmpxToken;
    
    /// @notice APY base para staking (15%)
    uint256 public constant BASE_APY = 15;
    
    /// @notice APY máximo para staking (35%)
    uint256 public constant MAX_APY = 35;
    
    /// @notice Período mínimo de vesting (30 días)
    uint256 public constant MIN_VESTING_PERIOD = 30 days;
    
    /// @notice Período máximo de vesting (365 días)
    uint256 public constant MAX_VESTING_PERIOD = 365 days;
    
    /// @notice Penalización por unstake temprano (10%)
    uint256 public constant EARLY_UNSTAKE_PENALTY = 10;
    
    /// @notice Multiplicador base para cálculos (para evitar decimales)
    uint256 public constant MULTIPLIER = 1e18;
    
    /**
     * @dev Estructura para información de staking de NFT
     */
    struct NFTStake {
        address owner;              // Propietario del NFT
        uint256 tokenId;           // ID del token NFT
        uint256 stakedAt;          // Timestamp de inicio de staking
        uint256 vestingPeriod;     // Período de vesting elegido
        uint256 lastClaimAt;       // Último claim de rewards
        uint256 rarityMultiplier;  // Multiplicador por rareza (100-200)
        bool isActive;             // Si el stake está activo
    }
    
    /**
     * @dev Estructura para información de staking de tokens GTK
     */
    struct TokenStake {
        address owner;             // Propietario de los tokens
        uint256 amount;            // Cantidad de tokens stakeados
        uint256 stakedAt;          // Timestamp de inicio de staking
        uint256 vestingPeriod;     // Período de vesting elegido
        uint256 lastClaimAt;       // Último claim de rewards
        bool isActive;             // Si el stake está activo
    }
    
    /// @notice Mapping de stakes de NFT por token ID
    mapping(uint256 => NFTStake) public nftStakes;
    
    /// @notice Mapping de stakes de token por usuario y índice
    mapping(address => mapping(uint256 => TokenStake)) public tokenStakes;
    
    /// @notice Contador de stakes de token por usuario
    mapping(address => uint256) public userTokenStakeCount;
    
    /// @notice NFTs stakeados por usuario
    mapping(address => uint256[]) public userStakedNFTs;
    
    /// @notice Total de NFTs stakeados
    uint256 public totalNFTsStaked;
    
    /// @notice Total de tokens GTK stakeados
    uint256 public totalGTKStaked;
    
    /// @notice Total de rewards distribuidos
    uint256 public totalRewardsDistributed;
    
    /// @notice Pool de rewards disponibles
    uint256 public rewardsPool;
    
    /// @notice Multiplicadores de rareza por tipo de NFT
    mapping(string => uint256) public rarityMultipliers;
    
    // Eventos
    event NFTStaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 vestingPeriod,
        uint256 rarityMultiplier,
        uint256 timestamp
    );
    
    event TokensStaked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 vestingPeriod,
        uint256 timestamp
    );
    
    event NFTUnstaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 rewards,
        uint256 penalty,
        uint256 timestamp
    );
    
    event TokensUnstaked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount,
        uint256 rewards,
        uint256 penalty,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardsPoolFunded(
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @notice Constructor del contrato StakingPool
     * @param _nftContract Dirección del contrato NFT
     * @param _gtkToken Dirección del token GTK
     * @param _cmpxToken Dirección del token CMPX
     */
    constructor(
        address _nftContract,
        address _gtkToken,
        address _cmpxToken
    ) Ownable(msg.sender) {
        require(_nftContract != address(0), "StakingPool: NFT contract cannot be zero address");
        require(_gtkToken != address(0), "StakingPool: GTK token cannot be zero address");
        require(_cmpxToken != address(0), "StakingPool: CMPX token cannot be zero address");
        
        nftContract = IERC721(_nftContract);
        gtkToken = IERC20(_gtkToken);
        cmpxToken = IERC20(_cmpxToken);
        
        // Configurar multiplicadores de rareza por defecto
        rarityMultipliers["common"] = 100;    // 1.0x
        rarityMultipliers["rare"] = 125;      // 1.25x
        rarityMultipliers["epic"] = 150;      // 1.5x
        rarityMultipliers["legendary"] = 200; // 2.0x
    }
    
    /**
     * @notice Stakea un NFT
     * @param tokenId ID del token NFT
     * @param vestingPeriod Período de vesting (30-365 días)
     * @param rarity Rareza del NFT ("common", "rare", "epic", "legendary")
     */
    function stakeNFT(
        uint256 tokenId,
        uint256 vestingPeriod,
        string memory rarity
    ) external nonReentrant whenNotPaused {
        require(vestingPeriod >= MIN_VESTING_PERIOD, "StakingPool: Vesting period too short");
        require(vestingPeriod <= MAX_VESTING_PERIOD, "StakingPool: Vesting period too long");
        require(nftContract.ownerOf(tokenId) == msg.sender, "StakingPool: Not owner of NFT");
        require(!nftStakes[tokenId].isActive, "StakingPool: NFT already staked");
        require(rarityMultipliers[rarity] > 0, "StakingPool: Invalid rarity");
        
        // Transferir NFT al contrato
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Crear stake
        nftStakes[tokenId] = NFTStake({
            owner: msg.sender,
            tokenId: tokenId,
            stakedAt: block.timestamp,
            vestingPeriod: vestingPeriod,
            lastClaimAt: block.timestamp,
            rarityMultiplier: rarityMultipliers[rarity],
            isActive: true
        });
        
        // Actualizar contadores
        userStakedNFTs[msg.sender].push(tokenId);
        totalNFTsStaked = totalNFTsStaked.add(1);
        
        emit NFTStaked(msg.sender, tokenId, vestingPeriod, rarityMultipliers[rarity], block.timestamp);
    }
    
    /**
     * @notice Stakea tokens GTK
     * @param amount Cantidad de tokens a stakear
     * @param vestingPeriod Período de vesting (30-365 días)
     */
    function stakeTokens(
        uint256 amount,
        uint256 vestingPeriod
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "StakingPool: Amount must be greater than 0");
        require(vestingPeriod >= MIN_VESTING_PERIOD, "StakingPool: Vesting period too short");
        require(vestingPeriod <= MAX_VESTING_PERIOD, "StakingPool: Vesting period too long");
        require(gtkToken.balanceOf(msg.sender) >= amount, "StakingPool: Insufficient GTK balance");
        
        // Transferir tokens al contrato
        require(gtkToken.transferFrom(msg.sender, address(this), amount), "StakingPool: Transfer failed");
        
        // Crear stake
        uint256 stakeIndex = userTokenStakeCount[msg.sender];
        tokenStakes[msg.sender][stakeIndex] = TokenStake({
            owner: msg.sender,
            amount: amount,
            stakedAt: block.timestamp,
            vestingPeriod: vestingPeriod,
            lastClaimAt: block.timestamp,
            isActive: true
        });
        
        // Actualizar contadores
        userTokenStakeCount[msg.sender] = userTokenStakeCount[msg.sender].add(1);
        totalGTKStaked = totalGTKStaked.add(amount);
        
        emit TokensStaked(msg.sender, stakeIndex, amount, vestingPeriod, block.timestamp);
    }
    
    /**
     * @notice Unstakea un NFT
     * @param tokenId ID del token NFT
     */
    function unstakeNFT(uint256 tokenId) external nonReentrant whenNotPaused {
        NFTStake storage stake = nftStakes[tokenId];
        require(stake.isActive, "StakingPool: NFT not staked");
        require(stake.owner == msg.sender, "StakingPool: Not owner of stake");
        
        // Calcular rewards
        uint256 rewards = calculateNFTRewards(tokenId);
        uint256 penalty = 0;
        
        // Verificar si es unstake temprano
        if (block.timestamp < stake.stakedAt.add(stake.vestingPeriod)) {
            penalty = rewards.mul(EARLY_UNSTAKE_PENALTY).div(100);
            rewards = rewards.sub(penalty);
        }
        
        // Marcar como inactivo
        stake.isActive = false;
        
        // Remover de la lista del usuario
        _removeNFTFromUserList(msg.sender, tokenId);
        
        // Actualizar contadores
        totalNFTsStaked = totalNFTsStaked.sub(1);
        
        // Transferir NFT de vuelta
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Transferir rewards si hay disponibles
        if (rewards > 0 && rewardsPool >= rewards) {
            rewardsPool = rewardsPool.sub(rewards);
            totalRewardsDistributed = totalRewardsDistributed.add(rewards);
            require(cmpxToken.transfer(msg.sender, rewards), "StakingPool: Reward transfer failed");
        }
        
        emit NFTUnstaked(msg.sender, tokenId, rewards, penalty, block.timestamp);
    }
    
    /**
     * @notice Unstakea tokens GTK
     * @param stakeIndex Índice del stake
     */
    function unstakeTokens(uint256 stakeIndex) external nonReentrant whenNotPaused {
        TokenStake storage stake = tokenStakes[msg.sender][stakeIndex];
        require(stake.isActive, "StakingPool: Tokens not staked");
        require(stake.owner == msg.sender, "StakingPool: Not owner of stake");
        
        // Calcular rewards
        uint256 rewards = calculateTokenRewards(msg.sender, stakeIndex);
        uint256 penalty = 0;
        
        // Verificar si es unstake temprano
        if (block.timestamp < stake.stakedAt.add(stake.vestingPeriod)) {
            penalty = rewards.mul(EARLY_UNSTAKE_PENALTY).div(100);
            rewards = rewards.sub(penalty);
        }
        
        uint256 stakedAmount = stake.amount;
        
        // Marcar como inactivo
        stake.isActive = false;
        
        // Actualizar contadores
        totalGTKStaked = totalGTKStaked.sub(stakedAmount);
        
        // Transferir tokens de vuelta
        require(gtkToken.transfer(msg.sender, stakedAmount), "StakingPool: Token transfer failed");
        
        // Transferir rewards si hay disponibles
        if (rewards > 0 && rewardsPool >= rewards) {
            rewardsPool = rewardsPool.sub(rewards);
            totalRewardsDistributed = totalRewardsDistributed.add(rewards);
            require(cmpxToken.transfer(msg.sender, rewards), "StakingPool: Reward transfer failed");
        }
        
        emit TokensUnstaked(msg.sender, stakeIndex, stakedAmount, rewards, penalty, block.timestamp);
    }
    
    /**
     * @notice Reclama rewards de NFT sin unstakear
     * @param tokenId ID del token NFT
     */
    function claimNFTRewards(uint256 tokenId) external nonReentrant whenNotPaused {
        NFTStake storage stake = nftStakes[tokenId];
        require(stake.isActive, "StakingPool: NFT not staked");
        require(stake.owner == msg.sender, "StakingPool: Not owner of stake");
        
        uint256 rewards = calculateNFTRewards(tokenId);
        require(rewards > 0, "StakingPool: No rewards available");
        require(rewardsPool >= rewards, "StakingPool: Insufficient rewards pool");
        
        // Actualizar último claim
        stake.lastClaimAt = block.timestamp;
        
        // Transferir rewards
        rewardsPool = rewardsPool.sub(rewards);
        totalRewardsDistributed = totalRewardsDistributed.add(rewards);
        require(cmpxToken.transfer(msg.sender, rewards), "StakingPool: Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, rewards, block.timestamp);
    }
    
    /**
     * @notice Reclama rewards de tokens sin unstakear
     * @param stakeIndex Índice del stake
     */
    function claimTokenRewards(uint256 stakeIndex) external nonReentrant whenNotPaused {
        TokenStake storage stake = tokenStakes[msg.sender][stakeIndex];
        require(stake.isActive, "StakingPool: Tokens not staked");
        require(stake.owner == msg.sender, "StakingPool: Not owner of stake");
        
        uint256 rewards = calculateTokenRewards(msg.sender, stakeIndex);
        require(rewards > 0, "StakingPool: No rewards available");
        require(rewardsPool >= rewards, "StakingPool: Insufficient rewards pool");
        
        // Actualizar último claim
        stake.lastClaimAt = block.timestamp;
        
        // Transferir rewards
        rewardsPool = rewardsPool.sub(rewards);
        totalRewardsDistributed = totalRewardsDistributed.add(rewards);
        require(cmpxToken.transfer(msg.sender, rewards), "StakingPool: Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, rewards, block.timestamp);
    }
    
    /**
     * @notice Calcula rewards pendientes para un NFT
     * @param tokenId ID del token NFT
     * @return uint256 Cantidad de rewards pendientes
     */
    function calculateNFTRewards(uint256 tokenId) public view returns (uint256) {
        NFTStake storage stake = nftStakes[tokenId];
        if (!stake.isActive) return 0;
        
        uint256 timeStaked = block.timestamp.sub(stake.lastClaimAt);
        uint256 apy = _calculateAPY(stake.vestingPeriod);
        
        // Base reward: 1 NFT = 100 CMPX base por año
        uint256 baseReward = 100 * MULTIPLIER;
        uint256 yearlyReward = baseReward.mul(apy).div(100);
        uint256 rewards = yearlyReward.mul(timeStaked).div(365 days);
        
        // Aplicar multiplicador de rareza
        rewards = rewards.mul(stake.rarityMultiplier).div(100);
        
        return rewards;
    }
    
    /**
     * @notice Calcula rewards pendientes para tokens
     * @param user Dirección del usuario
     * @param stakeIndex Índice del stake
     * @return uint256 Cantidad de rewards pendientes
     */
    function calculateTokenRewards(address user, uint256 stakeIndex) public view returns (uint256) {
        TokenStake storage stake = tokenStakes[user][stakeIndex];
        if (!stake.isActive) return 0;
        
        uint256 timeStaked = block.timestamp.sub(stake.lastClaimAt);
        uint256 apy = _calculateAPY(stake.vestingPeriod);
        
        uint256 yearlyReward = stake.amount.mul(apy).div(100);
        uint256 rewards = yearlyReward.mul(timeStaked).div(365 days);
        
        return rewards;
    }
    
    /**
     * @notice Calcula APY basado en el período de vesting
     * @param vestingPeriod Período de vesting
     * @return uint256 APY calculado
     */
    function _calculateAPY(uint256 vestingPeriod) internal pure returns (uint256) {
        if (vestingPeriod >= MAX_VESTING_PERIOD) {
            return MAX_APY; // 35% APY para 365 días
        } else if (vestingPeriod >= 270 days) {
            return 30; // 30% APY para 270 días (9 meses)
        } else if (vestingPeriod >= 180 days) {
            return 25; // 25% APY para 180 días (6 meses)
        } else if (vestingPeriod >= 90 days) {
            return 20; // 20% APY para 90 días (3 meses)
        } else {
            return BASE_APY; // 15% APY para 30 días (1 mes)
        }
    }
    
    /**
     * @notice Remueve un NFT de la lista del usuario
     * @param user Usuario
     * @param tokenId Token ID a remover
     */
    function _removeNFTFromUserList(address user, uint256 tokenId) internal {
        uint256[] storage userNFTs = userStakedNFTs[user];
        for (uint256 i = 0; i < userNFTs.length; i++) {
            if (userNFTs[i] == tokenId) {
                userNFTs[i] = userNFTs[userNFTs.length - 1];
                userNFTs.pop();
                break;
            }
        }
    }
    
    /**
     * @notice Financia el pool de rewards (solo owner)
     * @param amount Cantidad de CMPX a añadir
     */
    function fundRewardsPool(uint256 amount) external onlyOwner {
        require(amount > 0, "StakingPool: Amount must be greater than 0");
        require(cmpxToken.transferFrom(msg.sender, address(this), amount), "StakingPool: Transfer failed");
        
        rewardsPool = rewardsPool.add(amount);
        emit RewardsPoolFunded(amount, block.timestamp);
    }
    
    /**
     * @notice Actualiza multiplicador de rareza (solo owner)
     * @param rarity Tipo de rareza
     * @param multiplier Nuevo multiplicador
     */
    function setRarityMultiplier(string memory rarity, uint256 multiplier) external onlyOwner {
        require(multiplier >= 100 && multiplier <= 300, "StakingPool: Invalid multiplier range");
        rarityMultipliers[rarity] = multiplier;
    }
    
    /**
     * @notice Retorna NFTs stakeados por usuario
     * @param user Dirección del usuario
     * @return uint256[] Array de token IDs
     */
    function getUserStakedNFTs(address user) external view returns (uint256[] memory) {
        return userStakedNFTs[user];
    }
    
    /**
     * @notice Pausa el contrato (solo owner)
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
     * @notice Maneja la recepción de NFTs
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
