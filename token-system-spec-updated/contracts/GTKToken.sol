// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract GTKToken is ERC20Capped, ERC20Permit, Ownable, Pausable {
    event MinterUpdated(address indexed minter, bool enabled);

    address public minter;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_
    ) ERC20(name_, symbol_) ERC20Capped(cap_) ERC20Permit(name_) Ownable(msg.sender) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
        emit MinterUpdated(_minter, true);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 amount) internal override(ERC20) whenNotPaused {
        super._update(from, to, amount);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter || msg.sender == owner(), "Not minter");
        _mint(to, amount);
    }

    function _mint(address account, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }
}
