
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RIZToken is ERC20, Ownable {

    constructor() ERC20("Risitas", "RIZ") Ownable(msg.sender){
        _mint(msg.sender, 10000 * 10**decimals());
    }
}