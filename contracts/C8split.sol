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

  address admin;
  address[] public addressIndices;
  mapping(address => uint256) public balances;
  uint unlockDate;

  constructor(address _admin, ERC20 _token, uint _unlockDate) public {
    admin = _admin;
    token = _token;
    unlockDate = _unlockDate;
  }

  function split(uint256 _value) public {
    uint256 arrayLength = addressIndices.length;
    require(arrayLength > 0);
    uint256 amountSplit = _value / arrayLength;
    for (uint i = 0; i < arrayLength; i++) {
      balances[addressIndices[i]] += amountSplit;
    }
    require(token.transferFrom(msg.sender, admin, _value));
  }

  function withdraw() public {
    if (balances[msg.sender] > 0) {
      uint256 balance_temp = balances[msg.sender];
      balances[msg.sender] = 0;
      require(token.transferFrom(admin, msg.sender, balance_temp));
    } else {
      revert();
    }
  }

  function getBalance() public view returns (uint256){
    return balances[msg.sender];
  }

  function addNewUser(address _address) public onlyOwner {
    addressIndices.push(_address);

  }


}
