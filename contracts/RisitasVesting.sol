// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract RisitasVesting is Ownable {

    error VestingNotActive();
    error VestingActive();
    error NoTokensToRelease();
    error NoTokensToVest();

    ERC20 public token;

    uint64 public start;
    uint64 private immutable duration;

    mapping (address beneficiary => uint256) public balances;

    constructor(ERC20 _token) Ownable(msg.sender) {
        token = _token;
        start = 0;
        duration = 10000000;
    }

    function updateStartVesting() public onlyOwner {
        start = uint64(block.timestamp);
    }

    function release(address beneficiary) public {
        if (start == 0 || !isVestingActive()) {
            revert VestingNotActive();
        } else if (balances[beneficiary] == 0) {
            revert NoTokensToRelease();
        }
        uint256 amount = balances[beneficiary];
        token.transfer(beneficiary, amount);
        balances[beneficiary] = 0;
    }

    function isVestingActive() public view returns (bool) {
        return start != 0 && (block.timestamp >= start && block.timestamp <= start + duration);
    }

    function addBeneficiary(address beneficiary, uint256 amount) public {
        if (amount == 0) {
            revert NoTokensToVest();
        } else if (isVestingActive()) {
            revert VestingActive();
        }
        balances[beneficiary] += amount;
    }

    function beneficiaryAmount(address beneficiary) public view returns (uint256) {
        return balances[beneficiary];
    }

}