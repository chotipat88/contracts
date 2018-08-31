pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";




/**
 * @title CarboneumCrowdsale
 * @dev This is Carboneum fully fledged crowdsale.
 * CappedCrowdsale - sets a max boundary for raised funds.
 * AllowanceCrowdsale - token held by a wallet.
 * IndividuallyCappedCrowdsale - Crowdsale with per-user caps.
 * TimedCrowdsale - Crowdsale accepting contributions only within a time frame.
 */

contract C8split_many is Ownable {
  ERC20 token;
  uint delay;

  struct balanceDetails {
    uint balanceAmount;
    uint createDate;
    uint unlockDate;

  }

  address admin;
  address[] public addressIndices;
  mapping(address => balanceDetails) public balances;

  constructor(address _admin, ERC20 _token, uint _delay) public {
    admin = _admin;
    token = _token;

    delay = _delay;
  }

  function split(uint256 _value) public {
    uint256 arrayLength = addressIndices.length;
    require(arrayLength > 0);
    uint256 amountSplit = _value / arrayLength;
    for (uint i = 0; i < arrayLength; i++) {
      balances[addressIndices[i]].balanceAmount += amountSplit;
    }
    require(token.transferFrom(msg.sender, admin, _value));
  }

  function withdraw() public {
    if (balances[msg.sender].balanceAmount > 0 && now > balances[msg.sender].unlockDate) {
      uint256 balance_temp = balances[msg.sender].balanceAmount;
      balances[msg.sender].balanceAmount = 0;
      require(token.transferFrom(admin, msg.sender, balance_temp));
    } else {
      revert();
    }
  }

  function getBalance() public view returns (uint256){
    return balances[msg.sender].balanceAmount;
  }

  function addNewUser(address _address) public onlyOwner {
    addressIndices.push(_address);
    balances[_address].createDate = now;
    balances[_address].unlockDate = now + delay;
  }

  function getUnlockDate(address _address) public view returns(uint256){
    return balances[_address].unlockDate;
  }


}
