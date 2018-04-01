const fs = require('fs');
const Web3 = require('web3');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.accounts

try {
  fs.statSync('abi_definition');
  fs.statSync('bytecode');
} catch (err){
  console.log("Please run 'node setup_script.js' to create the ABI");
}

try {
  fs.statSync('twilio_key.txt');
} catch (err) {
  console.log('Please paste the twilio key into a file called twilio_key.txt');
}

const abiDefinition = JSON.parse(fs.readFileSync('abi_definition', 'utf-8'));
const CrowdChainContract = web3.eth.contract(abiDefinition);

const byteCode = JSON.parse(fs.readFileSync('bytecode', 'utf-8'));
const twilioKey = fs.readFileSync('twilio_key.txt', 'utf-8');
let currentContractAddress = null;
let currentContractInstance = null;
let currentListenerList = [];
let verifierAddress = null;

setupContractInstance();

app.get('/verify/:id', (req, res) => {
  console.log(req.url, 'was requested');
  verify(verifierAddress, req.query.id)
  .then(result => {
    res.send("Address " + req.query.id + " was verified.")
  })
  .catch(err => {
    console.log(err);
    res.status(500).send("Could not verify the desired address.");
  });
});



async function setupContractInstance() {
  let contractAddresses = await getAllContracts();
  console.log('Found ' + contractAddresses.length + ' contracts.')
  if (contractAddresses.length > 0) {
    currentContractAddress = contractAddresses[contractAddresses.length - 1];
    currentContractInstance = CrowdChainContract.at(currentContractAddress);
    initializeListeners(currentContractInstance);
  }
  verifierAddress = await findVerifier();
}


function getTransactionReceiptPromise(hash) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionReceipt(hash, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });

}

function getBlockPromise(index) {
  return new Promise((resolve, reject) => {
    web3.eth.getBlock(index, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function getAllTransactionReceipts(index) {
  return getBlockPromise(index)
  .then(block => {
    const trPromises = [];
    for (let i = 0; i < block.transactions.length; i += 1) {
      trPromises.push(getTransactionReceiptPromise(block.transactions[i]));
    }
    return Promise.all(trPromises);
  })
  .then(transactionReceipts => {
    let contractAddresses = [];
    for (let i = 0; i < transactionReceipts.length; i += 1) {
      if (transactionReceipts[i].contractAddress !== null) {
        contractAddresses.push(transactionReceipts[i].contractAddress);
      }
    }
    return contractAddresses;
  })
  .catch(err => {
    return Promise.reject(err);
  })
}

function getAllContracts() {
  console.log('getting all contracts');
  return getBlockPromise('latest')
  .then(latestBlock => {
    const latestIndex = latestBlock.number;

    const blocksPromises = [];
    for (let i = 0; i <= latestIndex; i += 1) {
      blocksPromises.push(getAllTransactionReceipts(i));
    }
    return Promise.all(blocksPromises);
  })
  .then(contractAddressLists => {
    let contractAddresses = [];
    for (let i = 0; i < contractAddressLists.length; i += 1) {
      if (contractAddressLists[i].length > 0) {
        if (typeof(contractAddressLists[i]) === typeof([])) {
          contractAddresses.push(...contractAddressLists[i]);
        } else if (typeof(contractAddressLists[i]) === typeof('hi')) {
          contractAddresses.push(contractAddressLists[i])
        }
      }
    }
    console.log('got all contracts');
    return contractAddresses;
  })
  .catch(err => {
      return Promise.reject(err);
  });
}

function initializeListeners(contractInstance) {
  const listenerList = ['PaymentReceived', 'PaymentGiven',
    'ProposalFulfilled', 'PromiseMade', 'FundingGiven', 'AgentVerified'];

  for (let i = 0; i < listenerList.length; i += 1) {
    let listener = currentContractInstance[listenerList[i]]();
    listener.watch((err, result) => {
      console.log(listenerList[i], err, result);
      if (listenerList[i] === 'ProposalFulfilled') {
        const phoneNumbers = [
          "+16264663854",
          "+14253943455",
          "+16263768265"
        ];
        const requests = [];
        for (let j = 0; j < phoneNumbers.length; j += 1) {
          request({
            method: 'POST',
            url: 'https://studio.twilio.com/v1/Flows/FWa5ecd5d4efa5e296f547ffb52f4676c7/Engagements',
            formData: {
              To: '+12159703578',
              From: phoneNumbers[j]
            },
            headers: {
              "ACCOUNT_SID": "AC4366e2744d3f1fd039fd4b4db36d60c0",
              "AUTH_TOKEN": twilioKey,
              "Cache-Control": "no-cache",
              "Postman-Token": "e7a72eff-8e54-43d5-90bb-c21cfbfa236e"
            }
          }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
              console.log('body', body);
            }
          });
        }
      }
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

function verify(userAddress, verifiedAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.verify(verifiedAddress, { from: userAddress, gas },
      function(err, result) {
      console.log(err, result);
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function getStatus() {
  return currentContractInstance.statusUpdate.call();
}

function getProposal() {
  return currentContractInstance.getProposal.call().toLocaleString();
}

function getAgent(userAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.findAgent({ from: userAddress, gas },
      function(err, result) {
        console.log(err, result);
        if (err) {
          return reject(err);
        }
        return resolve(result);
    });
  });
}

function getFunder(userAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.findFunder({ from: userAddress, gas },
      function(err, result) {
        console.log(err, result);
        if (err) {
          return reject(err);
        }
        return resolve(result);
    });
  });
}

function getVerifier(userAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.findVerifier({ from: userAddress, gas },
      function(err, result) {
        console.log(err, result);
        if (err) {
          return reject(err);
        }
        return resolve(result);
    });
  });
}

async function findVerifier() {
  for (let i = 0; i < web3.eth.accounts.length; i += 1) {
    try {
      await getVerifier(web3.eth.accounts[i]);
      console.log('Found verifier')
      return web3.eth.accounts[i];
    } catch (err) {
      continue;
    }
  }
  console.log('No verifier found')
  return null;
}

function getChairperson(userAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.getChairperson({ from: userAddress, gas },
      function(err, result) {
        console.log(err, result);
        if (err) {
          return reject(err);
        }
        return resolve(result);
    });
  });
}

function getUser(userAddress) {
  return Promise.resolve()
  .then(() => {
    const user = {
      chairperson: null,
      verifier: null,
      agent: null,
      funder: null
    };
    return getChairperson(userAddress)
    .then(result => {
      user.chairperson = result;
    })
    .catch(err => {})
    .then(getVerifier)
    .then(result => {
      user.verifier = result;
    })
    .catch(err => {})
    .then(getFunder)
    .then(result => {
      user.funder = result;
    })
    .catch(err => {})
    .then(getAgent)
    .then(result => {
      user.agent = result;
    })
    .catch(err => {})
    .then(() => user);
  });
}

function getUserAddress(index) {
  return web3.eth.accounts[index];
}

app.listen(3000, "0.0.0.0", () => {
  console.log('Verifier app listening on port 3000!');
});
