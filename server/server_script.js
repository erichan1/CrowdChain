const fs = require('fs');
const Web3 = require('web3');
const express = require('express');
const request = require('request');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.accounts

try {
  fs.statSync('abi_definition');
  fs.statSync('bytecode');
} catch (err){
  console.log("Please run 'node setup_script.js' to create the ABI");
}

const abiDefinition = JSON.parse(fs.readFileSync('abi_definition', 'utf-8'));
const CrowdChainContract = web3.eth.contract(abiDefinition);

const byteCode = JSON.parse(fs.readFileSync('bytecode', 'utf-8'));
let currentContractAddress = null;
let currentContractInstance = null;
let currentListenerList = [];

const app = express();

app.use('/', (req, res) => {
  console.log(req.url, 'was requested');
  const url = 'https://rpc.verafy.me' + req.url;
  let r = null;
  if (req.method === 'POST') {
    r = request.post({uri: url, json: req.body});
  } else {
    r = request(url);
  }
  req.pipe(r).pipe(res);
});


function checkForContracts(index='latest') {
  const block = web3.eth.getBlock(index);
  for (let i = 0; i < block.transactions.length; i += 1) {
    let transaction = web3.eth.getTransactionReceipt(block.transactions[i]);
    console.log(transaction.contractAddress);
    if (transaction.contractAddress !== null) {
      return contractAddress;
    }
  }
}

function createContract(chairperson, proposal, verifiers=[], value=100000000000, 
  numThreshold=2, stakeAmount=1000000000, gas=4700000) {
  const deployedContract = CrowdChainContract.new([
    proposal,
    numThreshold,
    stakeAmount,
    verifiers
  ], {
    data: byteCode, from: chairperson, gas, value
  });
  contractInstance = CrowdChainContract.at(deployedContract.address)
  currentContractInstance = contractInstance;
  currentContractAddress = deployedContract.address;
  initializeListeners(contractInstance);
  return deployedContract.address;
}

function initializeListeners(contractInstance) {
  const listenerList = ['PaymentReceived', 'PaymentGiven',
    'ProposalFulfilled', 'PromiseMade', 'FundingGiven', 'AgentVerified'];

  for (let i = 0; i < listenerList.length; i += 1) {
    let listener = currentContractInstance[listenerList[i]]();
    listener.watch((err, result) => {
      console.log(listenerList[i], err, result);
    });
    currentListenerList.push(listener);
  }
  /*
  const paymentReceived = currentContractInstance.PaymentReceived();
  paymentReceived.watch(function(err, result) {
    console.log(err, result);
  });
  const paymentGiven = currentContractInstance.PaymentGiven();
  paymentGiven.watch(function(err, result) {
    console.log(err, result);
  });
  const proposalFulfilled = currentContractInstance.ProposalFulfilled();
  proposalFulfilled.watch(function(err, result) {
    console.log(err, result);
  });
  const promiseMade = currentContractInstance.PromiseMade();
  promiseMade.watch(function(err, result) {
    console.log(err, result);
  });
  const fundingGiven = currentContractInstance.FundingGiven();
  fundingGiven.watch(function(err, result) {
    console.log(err, result);
  });
  const agentVerified = currentContractInstance.AgentVerified();
  agentVerified.watch(function(err, result) {
    console.log(err, result);
  });
  */
}

function fund(userAddress, funding, gas=100000) {
  currentContractInstance.fund({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}

function promise(userAddress, gas=100000) {
  currentContractInstance.promise({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}

function verify(userAddress, verifiedAddress, gas=100000) {
  currentContractInstance.verify(verifiedAddress, { from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });

}

function disburse(userAddress, gas=100000) {
  currentContractInstance.disburse({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}

function getStatus() {
  return currentContractInstance.statusUpdate.call();
}

function getProposal() {
  return currentContractInstance.getProposal.call().toLocaleString();
}

function getAgent(userAddress) {
  return currentContractInstance.findAgent({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}

function getFunder(userAddress) {
  return currentContractInstance.findFunder({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}

function getVerifier(userAddress) {
  return currentContractInstance.findVerifier({ from: userAddress, gas },
    function(err, result) {
    console.log(err, result);
  });
}


function getUserAddress(index) {
  return web3.eth.accounts[index];
}

