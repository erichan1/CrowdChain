const fs = require('fs');
const Web3 = require('web3');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.accounts

try {
  fs.statSync('abi_definition');
  fs.statSync('bytecode');
} catch (err){
  console.log("Please run 'node setup_script.js' to create the ABI");
}

const abiDefinition = JSON.parse(fs.readFileSync('abi_definition', 'utf-8'));
console.log(abiDefinition);
const CrowdChainContract = web3.eth.contract(abiDefinition);

const byteCode = JSON.parse(fs.readFileSync('bytecode', 'utf-8'));
let currentContractAddress = null;
let currentContractInstance = null;
let currentListenerList = [];

function createContract(chairperson, proposal, verifiers=[], 
  numThreshold=2, stakeAmount=1000000000, gas=4700000) {
  const deployedContract = CrowdChainContract.new([
    proposal,
    numThreshold,
    stakeAmount,
    verifiers
  ], {
    data: byteCode, from: chairperson, gas
  });
  contractInstance = CrowdChainContract.at(deployedContract.address)
  currentContractInstance = contractInstance;
  currentContractAddress = deployedContract.address;
  console.log(currentContractAddress);
  return deployedContract.address;
}

const address = createContract(web3.eth.accounts[0], "Let's go green!",
  [web3.eth.accounts[1]])
console.log(address);
