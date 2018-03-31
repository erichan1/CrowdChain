pragma solidity ^0.4.18;
// We have to specify what version of compiler this code will compile with

contract CrowdChain {
  
  //number of people that have joined this cause. 
  uint8 public numJoined;
  //number of people total
  uint8 public numTotal;
  //amount of money available to this crowdchain
  uint32 public money;
  //the goal of this crowdchain. ex: Join us in solving LA traffic!
  string proposal;

  function CrowdChain(string prop, uint8 _numTotal) public {
    proposal = prop;
    numJoined = 0;
    numTotal = _numTotal;
    money = 0;
  }

  function getNumJoined() view public returns (uint8) {
    return numJoined;
  }

  function incrementJoined() public {
    numJoined += 1;
  }

  function decrementJoined() public {
    numJoined -= 1;
  }

  function getMoney() view public returns (uint32) {
    return money;
  }

  function addMoney(uint32 sum) public {
    money += sum;
  }

  function getProposal() view public returns (string) {
    return proposal;
  }

}