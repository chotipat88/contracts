pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * @title CarboneumCrowdsale
 * @dev This is Carboneum fully fledged crowdsale.
 * CappedCrowdsale - sets a max boundary for raised funds.
 * AllowanceCrowdsale - token held by a wallet.
 * IndividuallyCappedCrowdsale - Crowdsale with per-user caps.
 * TimedCrowdsale - Crowdsale accepting contributions only within a time frame.
 */

contract C8split {
  ERC20 token;

  address address1;
  address address2;
  address admin;
  uint unlockDate;
  uint256 balance1;
  uint256 balance2;


  constructor(address _address1, address _address2, address _admin, ERC20 _token, uint _unlockDate) public {
    address1 = _address1;
    address2 = _address2;
    admin = _admin;
    token = _token;
    unlockDate = _unlockDate;
  }

  function split(uint256 _value) public {
    uint256 amountSplit = _value / 2;

    balance1 += amountSplit;
    balance2 += amountSplit;
    require(token.transferFrom(msg.sender, admin, _value));
  }

  function withdraw() public {
    if(msg.sender == address1) {
      uint256 balance1_temp = balance1;
      balance1 = 0;
      require(token.transferFrom(admin, address1, balance1_temp));
    } else if (msg.sender == address2) {
      uint256 balance2_temp = balance2;
      balance2 = 0;
      require(token.transferFrom(admin, address2, balance2_temp));
    } else {
      revert();
    }
  }

  function getBalance1() public view returns(uint256){
    return balance1;
  }

  function getBalance2() public view returns(uint256){
    return balance2;
  }





}
