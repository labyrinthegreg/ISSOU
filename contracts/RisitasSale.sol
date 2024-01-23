// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import "./RIZToken.sol";

contract RisitasSale is Ownable  { 

  // The token being sold
  RIZToken public token;

  // Address where funds are collected
  address payable public wallet;

  // How many token units a buyer gets per ether.
  // The rate is the conversion between ether and the smallest and indivisible token unit.
  // So, if you are using a rate of 1 with a DetailedERC20 token with 3 decimals called TOK
  // 1 ether will give you 1 unit, or 0.001 TOK.
  uint256 public rate;

  // Amount of ether raised
  uint256 public etherRaised;

  // State of the sale
  bool private cancelSale = false;

  error NoEtherError();
  error SaleNotActive();
  error OwnerOnlyAction();
  error SaleNotClose();

  event SaleUpdated();
 
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  constructor(uint256 _rate, RIZToken _token) payable Ownable(msg.sender) {
    require(_rate > 0);

    rate = _rate;
    wallet = payable(msg.sender);
    token = _token;
  }

  function buyTokens() public payable {
    if (msg.value == 0) {
      revert NoEtherError();
    } else if (cancelSale) {
      revert SaleNotActive();
    }
    
    address beneficiary = msg.sender;

    uint256 etherAmount = msg.value;
  
    // calculate token amount to be created
    uint256 tokens = etherAmount * rate;

    // update state
    etherRaised += etherAmount;

    token.transfer(beneficiary, tokens);

    emit TokenPurchase(
      msg.sender,
      beneficiary,
      etherAmount,
      tokens
    );
    
  }

  function getIsSaleClosed() external view returns (bool) {
    return cancelSale;
  }

  function closeSale() external onlyOwner {
    emit SaleUpdated();
    cancelSale = true;
  }

  function resumeSale() external onlyOwner {
    emit SaleUpdated();
    cancelSale = false;
  }

  function withdraw() external onlyOwner {
    if(cancelSale == false){
      revert SaleNotClose(); 
    }
    if(address(this).balance == 0){
      revert NoEtherError(); 
    }
    wallet.transfer(address(this).balance);
  }

}