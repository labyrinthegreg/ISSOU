// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RisitasSale  { 

  // The token being sold
  ERC20 public token;

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
  bool private isSaleActive = true;

  error NoEtherError();
  error NoBeneficiary();
  error ScaleNotActive();

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value ethers paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  /**
   * @param _rate Number of token units a buyer gets per ether
   * @param _token Address of the token being sold
   */
  constructor(uint256 _rate, ERC20 _token) payable {
    require(_rate > 0);

    rate = _rate;
    wallet = payable(msg.sender);
    token = _token;
  }

  function buyTokens() public payable {
    address beneficiary = msg.sender;

    uint256 etherAmount = msg.value;

    if (beneficiary != address(0)) {
      revert NoBeneficiary();
    } else if (etherAmount != 0) {
      revert NoEtherError();
    } else if (isSaleActive) {
      revert ScaleNotActive();
    }

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

    wallet.transfer(etherAmount);
  }
  
  /**
   * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
   * @param _beneficiary Address performing the token purchase
   * @param _tokenAmount Number of tokens to be emitted
   */
  function _deliverTokens(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    
  }

  function getIsSaleActive() external view returns (bool) {
    return isSaleActive;
  }

  function cancelSale() external onlyOwner {
    isSaleActive = false;
    rate = 35;
  }

  function resumeSale() external onlyOwner {
    isSaleActive = true;
  }

  receive() external payable {
    revert("This contract does not accept Ether directly"); 
  }

  modifier onlyOwner() {
        require(
            msg.sender == wallet,
            "Only the contract owner can call this function"
        );
        _;
    }
}