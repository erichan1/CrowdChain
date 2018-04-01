const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.accounts

const code = fs.readFileSync('CrowdChain.sol').toString();
const compiledCode = solc.compile(code);
console.log(compiledCode)
const abiDefinition = JSON.parse(compiledCode.contracts[':CrowdChain'].interface)
const byteCode = compiledCode.contracts[':CrowdChain'].bytecode
fs.writeFileSync('abi_definition', JSON.stringify(abiDefinition));
fs.writeFileSync('bytecode', JSON.stringify(byteCode));
/*
const CrowdChainContract = web3.eth.contract(abiDefinition);
const byteCode = compiledCode.contracts[':CrowdChain'].bytecode;

"Let's all ride the bus to work today to reduce congestion and pollution", 3, 1, ["0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"]


deployedContract = CrowdChainContract.new([
    'Let\'s all ride the bus to work today to reduce congestion and pollution',
    3,
    1,
    [
        web3.eth.accounts[2]
    ]
], {data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
console.log(deployedContract.address)
// '0x42024c832d90e20281a2c88e92a8af15b38383f5'
contractInstance = CrowdChainContract.at(deployedContract.address)
contractInstance.fund({from: web3.eth.accounts[1]}, function() {
    console.log('funded by ' + web3.eth.accounts[1]);
});
contractInstance.promise({gas: 100000, from: web3.eth.accounts[3]}, function() {
    console.log('promised by ' + web3.eth.accounts[3]);
});
contractInstance.promise({gas: 100000, from: web3.eth.accounts[4]}, function() {
    console.log('promised by ' + web3.eth.accounts[4]);
});
contractInstance.verify(web3.eth.accounts[3], {gas: 100000, from: web3.eth.accounts[1]}, function() {
    console.log('attempted verify ' + web3.eth.accounts[3] + ' by ' +
        web3.eth.accounts[2]);
});
contractInstance.promise({gas: 100000, from: web3.eth.accounts[5]}, function() {
    console.log('promised by ' + web3.eth.accounts[5]);
});
contractInstance.verify(web3.eth.accounts[3], {gas: 100000, from: web3.eth.accounts[2]}, function() {
    console.log('verified ' + web3.eth.accounts[3] + ' by ' +
        web3.eth.accounts[2]);
});
contractInstance.disburse({gas: 100000, from: web3.eth.accounts[3]}, function() {
    console.log('disbursed for ' + web3.eth.accounts[3]);
});
contractInstance.disburse({gas: 100000, from: web3.eth.accounts[4]}, function() {
    console.log('attempted disburse for ' + web3.eth.accounts[4]);
});

console.log(contractInstance.voteForCandidate('Rama', {gas: 100000, from: web3.eth.accounts[0]}))
console.log(contractInstance.totalVotesFor.call('Rama').toLocaleString())

(0) 0x04881ee75a3db519ae319faf2c31f62eb7d8abf7
(1) 0x78ed1beff2e9c852b549acb76cf6c3dd2b02147b
(2) 0x320939d781bcd81acc87b5dc68c7ec10e0d5ffdb
(3) 0xa7456be9051a8e6719e734a2ffcada3715644ce9
(4) 0x1dc2cd15ea2e0744a80114bc6fde1a0f8919b56e
(5) 0x64ddc74c6e54915becb67f88f6df9b98d0611905
(6) 0x5a699effd8449e0db3e7ba098a630e45186876d9
(7) 0xa6f24d460a44d34e0b750997c86b5b34dc2f609b
(8) 0x48d3649ffbff66b732dda86eed62f76594f44d5e
(9) 0xc1b9ee4a62fbe97e8a7274f8123517fb00a53181

*/