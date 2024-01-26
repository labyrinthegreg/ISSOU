// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import "./RIZToken.sol";

contract RisitasSale is Ownable  { 

  RIZToken public token;

  address payable public wallet;

  State public actualState = State.LOVEMONEY;

  uint256 public rate;

  uint256 public etherRaised;

  bool private cancelSale = false;

  enum State {
    ICO,
    LOVEMONEY,
    PRESALE
  }

  error NoEtherError();
  error NoTokenError();
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

  constructor(RIZToken _token) payable Ownable(msg.sender) {

    wallet = payable(msg.sender);
    token = _token;
    updateRateForState(State.LOVEMONEY);
  }

  function buyTokens() public payable {
    if (msg.value == 0) {
      revert NoEtherError();
    } else if (cancelSale) {
      revert SaleNotActive();
    } else if (token.balanceOf(address(this)) == 0) {
      revert NoTokenError();
    }
    
    address beneficiary = msg.sender;

    uint256 etherAmount = msg.value;
  
    uint256 tokens = etherAmount * rate;

    etherRaised += etherAmount;

    token.transfer(beneficiary, tokens);

    emit TokenPurchase(
      msg.sender,
      beneficiary,
      etherAmount,
      tokens
    );
    
  }


  function updateRateForState(State state) private {
    if (state == State.LOVEMONEY) {
      rate = 50;
    } else if (state == State.PRESALE) {
      rate = 23;
    } else {
      rate = 10;
    }
    actualState = state;
  }

  function loveMoneyState() external onlyOwner {
    updateRateForState(State.LOVEMONEY);
  }
  function preSaleMoneyState() external onlyOwner {
    updateRateForState(State.PRESALE);
  }
  function icoMoneyState() external onlyOwner {
    updateRateForState(State.ICO);
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

  function withdrawLastTokens() external onlyOwner {
    if (cancelSale == false) {
      revert SaleNotClose();
    }
    if (token.balanceOf(address(this)) == 0) {
      revert NoTokenError();
    }
    token.transfer(wallet, token.balanceOf(address(this)));
  }

}