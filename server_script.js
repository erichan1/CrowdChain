const fs = require('fs');
const Web3 = require('web3');
const express = require('express');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.accounts

try {
    fs.statSync('abi_definition');
} catch (err){
    console.log("Please run 'node setup_script.js' to create the ABI");
}

const abiDefinition = JSON.parse(fs.readFileSync('abi_definition', 'utf-8'));
const CrowdChainContract = web3.eth.contract(abiDefinition);
const byteCode = compiledCode.contracts[':CrowdChain'].bytecode;
let serverContractAddress = null;
let serverContractInstance = null;
let serverListenerList = [];

function createContract(chairperson, proposal, numThreshold=2, stakeAmount=1,
    verifiers=[], gas=4700000) {
    const deployedContract = CrowdChainContract.new([
        proposal,
        numThreshold,
        stakeAmount,
        verifiers
    ], {
        data: byteCode, from: chairperson, gas: gas
    });
    contractInstance = CrowdChainContract.at(deployedContract.address)
    serverContractInstance = contractInstance;
    serverContractAddress = deployedContract.address;
    initializeListeners(contractInstance);
    return deployedContract.address;
}

function initializeListeners(contractInstance) {
    const listenerList = ['PaymentReceived', 'PaymentGiven',
        'ProposalFulfilled', 'PromiseMade', 'FundingGiven', 'AgentVerified'];

    for (let i = 0; i < listenerList.length; i += 1) {
        let listener = serverContractInstance[listenerList[i]]();
        listener.watch((err, result) => {
            console.log(listenerList[i], err, result);
        });
        serverListenerList.push(listener);
    }
    /*
    const paymentReceived = serverContractInstance.PaymentReceived();
    paymentReceived.watch(function(err, result) {
        console.log(err, result);
    });
    const paymentGiven = serverContractInstance.PaymentGiven();
    paymentGiven.watch(function(err, result) {
        console.log(err, result);
    });
    const proposalFulfilled = serverContractInstance.ProposalFulfilled();
    proposalFulfilled.watch(function(err, result) {
        console.log(err, result);
    });
    const promiseMade = serverContractInstance.PromiseMade();
    promiseMade.watch(function(err, result) {
        console.log(err, result);
    });
    const fundingGiven = serverContractInstance.FundingGiven();
    fundingGiven.watch(function(err, result) {
        console.log(err, result);
    });
    const agentVerified = serverContractInstance.AgentVerified();
    agentVerified.watch(function(err, result) {
        console.log(err, result);
    });
    */
}

function fund(userAddress, funding, gas=100000) {
    serverContractInstance.fund({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function promise(userAddress, gas=100000) {
    serverContractInstance.promise({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function verify(userAddress, verifiedAddress, gas=100000) {
    serverContractInstance.verify(verifiedAddress, { from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });

}

function disburse(userAddress, gas=100000) {
    serverContractInstance.disburse({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function getStatus() {
    return serverContractInstance.statusUpdate.call();
}

function getProposal() {
    return serverContractInstance.getProposal.call().toLocaleString();
}

function getAgent(userAddress) {
    return serverContractInstance.getAgent.call(userAddress)
}

function getNumJoined() {
    return serverContractInstance.getNumJoined.call()
}

function getNumThreshold() {

}

function getUserAddress(index) {
    return web3.eth.accounts[index];
}

