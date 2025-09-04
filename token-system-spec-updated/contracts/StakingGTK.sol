// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingGTK is Ownable, Pausable {
    IERC20 public immutable stakingToken;
    IERC20 public rewardToken;

    uint256 public rewardRate;           // tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    uint256 public lockupSeconds = 30 days;
    uint256 public startTime;
    uint256 public endTime;

    mapping(address => uint256) public userStake;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public stakeTimestamp;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event ParamsUpdated(uint256 rewardRate, uint256 lockupSeconds);

    constructor(IERC20 _stakingToken, IERC20 _rewardToken) Ownable(msg.sender) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        _pause(); // 🚫 Inicia pausado hasta release
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        uint256 t = block.timestamp;
        if (endTime == 0) return t;
        return t < endTime ? t : endTime;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + ( (lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18 ) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        return (userStake[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / 1e18) + rewards[account];
    }

    function setParams(uint256 _rewardRate, uint256 _lockupSeconds, uint256 _startTime, uint256 _endTime) external onlyOwner whenPaused {
        rewardRate = _rewardRate;
        lockupSeconds = _lockupSeconds;
        startTime = _startTime;
        endTime = _endTime;
        emit ParamsUpdated(_rewardRate, _lockupSeconds);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { 
        require(block.timestamp >= startTime, "Not started");
        _unpause(); 
        lastUpdateTime = block.timestamp;
    }

    function stake(uint256 amount) external updateReward(msg.sender) whenNotPaused {
        require(block.timestamp >= startTime, "Staking not started");
        require(amount > 0, "Amount=0");
        totalStaked += amount;
        userStake[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) whenNotPaused {
        require(amount > 0, "Amount=0");
        require(userStake[msg.sender] >= amount, "Insufficient stake");
        require(block.timestamp >= stakeTimestamp[msg.sender] + lockupSeconds, "Locked");
        totalStaked -= amount;
        userStake[msg.sender] -= amount;
        require(stakingToken.transfer(msg.sender, amount), "transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() public updateReward(msg.sender) whenNotPaused {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(rewardToken.transfer(msg.sender, reward), "reward transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }

    function exit() external {
        withdraw(userStake[msg.sender]);
        getReward();
    }
}
