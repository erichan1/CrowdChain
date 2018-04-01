window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  CrowdChainContract = web3.eth.contract(abiDefinition);
  userAddress = web3.eth.accounts[0];
  getAllContracts()
  .then(contractAddresses => {
    if (contractAddresses.length > 0) {
      currentContractAddress = contractAddresses[contractAddresses.length - 1];
      currentContractInstance = CrowdChainContract.at(currentContractAddress);
      initializeListeners(currentContractInstance);

      $(document).ready(function() {
        new QRCode(document.getElementById("qrcode"), "https://crowdchain.verafy.me/verify/" + userAddress);
        refreshFields();
      });
    }
    return Promise.resolve();
  });
});

let currentContractAddress = null;
let currentContractInstance = null;
let currentListenerList = [];

const abiDefinition = JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"funders","outputs":[{"name":"funding","type":"uint256"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renege","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"statusUpdate","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"bool"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"findVerifier","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"promise","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"findFunder","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"findAgent","outputs":[{"name":"","type":"bool"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_verifierAddress","type":"address"}],"name":"deleteVerifier","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numThreshold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"stakeAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_agentAddress","type":"address"}],"name":"verify","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"statusList","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"verifiers","outputs":[{"name":"isTrusted","type":"bool"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposal","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getChairperson","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_verifierAddress","type":"address"}],"name":"addVerifier","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"bounty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numJoined","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"disburse","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"fund","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getProposal","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"agents","outputs":[{"name":"verified","type":"bool"},{"name":"paid","type":"bool"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_proposal","type":"string"},{"name":"_numThreshold","type":"uint256"},{"name":"_stakeAmount","type":"uint256"},{"name":"_verifiers","type":"address[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"PaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"PaymentGiven","type":"event"},{"anonymous":false,"inputs":[],"name":"ProposalFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"PromiseMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"FundingGiven","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"verifier","type":"address"},{"indexed":false,"name":"verified","type":"address"}],"name":"AgentVerified","type":"event"}]');
const bytecode = "606060405234156200001057600080fd5b60405162001eac38038062001eac83398101604052808051820191906020018051906020019091908051906020019091908051820191905050600080336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508560079080519060200190620000a49291906200019a565b50600060048190555084600581905550836009819055506000600860006101000a81548160ff0219169083151502179055506000600681905550600091505b82518210156200018e576002600084848151811015156200010057fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160000160006101000a81548160ff02191690831515021790555060018160000160016101000a81548160ff0219169083151502179055508180600101925050620000e3565b50505050505062000249565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620001dd57805160ff19168380011785556200020e565b828001600101855582156200020e579182015b828111156200020d578251825591602001919060010190620001f0565b5b5090506200021d919062000221565b5090565b6200024691905b808211156200024257600081600090555060010162000228565b5090565b90565b611c5380620002596000396000f300606060405260043610610149576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063031b36771461014e57806308686535146101a65780632e4176cf146101cf5780632e7502b914610224578063385a9c37146102d9578063425765f81461030657806344ac21ee146103335780634ed981ea1461033d5780635064ef4e1461036657806355f328171461039e57806358e733b4146103d7578063590e1ae31461040057806360c7dc471461041557806363a9c3d71461043e57806363ce6a3a146104775780636c824487146104a7578063753ec103146105035780637d80c38e146105915780639000b3d6146105e6578063943dfef11461061f5780639dfd0f8c14610648578063abc6fd0b14610671578063b60d42881461069a578063b9e2bea0146106a4578063fd66091e14610732575b600080fd5b341561015957600080fd5b610185600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610799565b60405180838152602001821515151581526020019250505060405180910390f35b34156101b157600080fd5b6101b96107ca565b6040518082815260200191505060405180910390f35b34156101da57600080fd5b6101e2610991565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561022f57600080fd5b6102376109b6565b604051808781526020018681526020018581526020018060200184151515158152602001838152602001828103825285818151815260200191508051906020019080838360005b8381101561029957808201518184015260208101905061027e565b50505050905090810190601f1680156102c65780820380516001836020036101000a031916815260200191505b5097505050505050505060405180910390f35b34156102e457600080fd5b6102ec610a94565b604051808215151515815260200191505060405180910390f35b341561031157600080fd5b610319610aa7565b604051808215151515815260200191505060405180910390f35b61033b610b59565b005b341561034857600080fd5b610350610d7e565b6040518082815260200191505060405180910390f35b341561037157600080fd5b610379610e23565b6040518083151515158152602001821515151581526020019250505060405180910390f35b34156103a957600080fd5b6103d5600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610f29565b005b34156103e257600080fd5b6103ea610ff1565b6040518082815260200191505060405180910390f35b341561040b57600080fd5b610413610ff7565b005b341561042057600080fd5b610428611257565b6040518082815260200191505060405180910390f35b341561044957600080fd5b610475600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061125d565b005b341561048257600080fd5b61048a61142b565b604051808381526020018281526020019250505060405180910390f35b34156104b257600080fd5b6104de600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061143c565b6040518083151515158152602001821515151581526020019250505060405180910390f35b341561050e57600080fd5b61051661147a565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561055657808201518184015260208101905061053b565b50505050905090810190601f1680156105835780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561059c57600080fd5b6105a4611518565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156105f157600080fd5b61061d600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050611541565b005b341561062a57600080fd5b61063261161d565b6040518082815260200191505060405180910390f35b341561065357600080fd5b61065b611623565b6040518082815260200191505060405180910390f35b341561067c57600080fd5b610684611629565b6040518082815260200191505060405180910390f35b6106a26118a2565b005b34156106af57600080fd5b6106b7611afd565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156106f75780820151818401526020810190506106dc565b50505050905090810190601f1680156107245780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561073d57600080fd5b610769600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050611ba5565b60405180841515151581526020018315151515815260200182151515158152602001935050505060405180910390f35b60036020528060005260406000206000915090508060000154908060010160009054906101000a900460ff16905082565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151561082757600080fd5b6000801515600860009054906101000a900460ff16151514151561084a57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc6009549081150290604051600060405180830381858888f19350505050151561088c57600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600080820160006101000a81549060ff02191690556000820160016101000a81549060ff02191690556000820160026101000a81549060ff0219169055505060016004600082825403925050819055507f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce233600954604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a160095491505090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060006109c3611c13565b6000806004546005546006546007600860009054906101000a900460ff16600954828054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a795780601f10610a4e57610100808354040283529160200191610a79565b820191906000526020600020905b815481529060010190602001808311610a5c57829003601f168201915b50505050509250955095509550955095509550909192939495565b600860009054906101000a900460ff1681565b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff161515610b0457600080fd5b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160009054906101000a900460ff16905090565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151515610bb757600080fd5b6000801515600860009054906101000a900460ff161515141515610bda57600080fd5b6009543410151515610beb57600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020915060008260000160006101000a81548160ff02191690831515021790555060008260000160016101000a81548160ff02191690831515021790555060018260000160026101000a81548160ff0219169083151502179055506001600460008282540192505081905550600554600454101515610cac57610cab6001611bf6565b5b7f6ef95f06320e7a25a04a175ca677b7052bdd97131872c2192525a629f51be7703334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a17fe8e64efa152b0687423964818a6fea8bc970ef0e74819068392b04bdac7f6a4e33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15050565b6000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff161515610ddb57600080fd5b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154905090565b600080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff161515610e8157600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160009054906101000a900460ff16600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff16915091509091565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610f8457600080fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600080820160006101000a81549060ff02191690556000820160016101000a81549060ff0219169055505050565b60055481565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff16151561105257600080fd5b6000801515600860009054906101000a900460ff16151514151561107557600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001549081150290604051600060405180830381858888f1935050505015156110f757600080fd5b7f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce233600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154600660008282540392505081905550600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000808201600090556001820160006101000a81549060ff0219169055505050565b60095481565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff1615156112b857600080fd5b6001801515600860009054906101000a900460ff1615151415156112db57600080fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151561133657600080fd5b60018060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160006101000a81548160ff0219169083151502179055507f4968ab6b9bcf514b7b2c4ff84d96f741ceebd7d69c55cab481f8e0da8fddbb973383604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a15050565b600080600454600554915091509091565b60026020528060005260406000206000915090508060000160009054906101000a900460ff16908060000160019054906101000a900460ff16905082565b60078054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156115105780601f106114e557610100808354040283529160200191611510565b820191906000526020600020905b8154815290600101906020018083116114f357829003601f168201915b505050505081565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561159e57600080fd5b600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160000160006101000a81548160ff02191690831515021790555060018160000160016101000a81548160ff0219169083151502179055505050565b60065481565b60045481565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151561168657600080fd5b6001801515600860009054906101000a900460ff1615151415156116a957600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff1680156117525750600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff16155b151561175d57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc60095460045460065481151561178957fe5b04019081150290604051600060405180830381858888f1935050505015156117b057600080fd5b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160016101000a81548160ff0219169083151502179055507f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce23360095460045460065481151561183e57fe5b0401604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a160095460045460065481151561189a57fe5b040191505090565b600080801515600860009054906101000a900460ff1615151415156118c657600080fd5b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209150600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff1615156119c3576000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555060018260010160006101000a81548160ff0219169083151502179055505b34600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160008282540192505081905550346006600082825401925050819055507fb741f30322e51134d94cb3c8e4d323dfbcfd60a7a86243f62faa4ae60528f8b03334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a17f6ef95f06320e7a25a04a175ca677b7052bdd97131872c2192525a629f51be7703334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15050565b611b05611c13565b60078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015611b9b5780601f10611b7057610100808354040283529160200191611b9b565b820191906000526020600020905b815481529060010190602001808311611b7e57829003601f168201915b5050505050905090565b60016020528060005260406000206000915090508060000160009054906101000a900460ff16908060000160019054906101000a900460ff16908060000160029054906101000a900460ff16905083565b80600860006101000a81548160ff02191690831515021790555050565b6020604051908101604052806000815250905600a165627a7a723058202a201aab691c15f24e54047fe0d1f16559c932eb9df3074fe7d69b9201f269060029";
let CrowdChainContract = null;
let userAddress = null;

async function refreshFields() {
  const status = getStatus();
  const user = await getUser();

  $("#currNumJoined").html(status[0].toNumber());
  $("#currNumThreshold").html(status[1].toNumber());
  $("#currBounty").html(status[2].toNumber());
  if (status[3].length > 0) {
    $("#currProposal").html(status[3]);
  }
  $("#currIsFulfilled").html(status[4] + "");
  $("#currStakeAmount").html(status[5].toNumber());
  for (let i = 0; i <= 100; i += 1) {
    $("#progressBar").removeClass("w-" + i); 
  }currIsFulfilled
  const progressAmount = Math.min(Math.round(status[0].toNumber() /
    (status[1].toNumber() + 0.001)), 100);
  $('#progressBar').addClass("w-"+ progressAmount);
  $('#progressBar').html(progressAmount + "% complete");

  if (user.agent != null) {
    $('#verified').show();
    $('#paid').show();
    $('#verified').html("Agent commitment verified<span class=\"badge badge-primary badge-pill\">" + user.agent[0] + "</span>");
    $('#paid').html("Agent reward claimed<span class=\"badge badge-primary badge-pill\">" + user.agent[1] + "</span>");
  } else {
    $('#verified').hide();
    $('#paid').hide();
  }
  if (user.funder != null) {
    $('#funding').show();
    $('#funding').html("Provided funding<span class=\"badge badge-primary badge-pill\">" + user.funder.toNumber() + "</span>");
  } else {
    $('#funding').hide();
  }
  if (user.verifier != null) {
    $('#isTrusted').show();
    $('#isTrusted').html("Trusted verifier<span class=\"badge badge-primary badge-pill\">" + user.verifier + "</span>");
  } else {
    $('#isTrusted').hide();
  }
  if (user.chairperson != null) {
    $('#isChairperson').show();
    $('#isChairperson').html("Chairperson<span class=\"badge badge-primary badge-pill\">True</span>");
  } else {
    $('#isChairperson').hide();
  }
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
    const lastUpdatedIndex = JSON.parse(localStorage.getItem('latestIndex'));
    let lastContractAddresses = JSON.parse(localStorage.getItem('contractAddresses'));

    if (lastContractAddresses.length > 0 && lastContractAddresses[0].length < 10) {
      lastContractAddresses = [];
    }

    if (lastUpdatedIndex !== null) {
      if (lastUpdatedIndex === latestIndex && lastContractAddresses.length > 0) {
        return lastContractAddresses;
      }
    }

    const blocksPromises = [];
    for (let i = 0; i <= latestIndex; i += 1) {
      blocksPromises.push(getAllTransactionReceipts(i));
    }

    localStorage.setItem('latestIndex', JSON.stringify(latestIndex));
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
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));

    return contractAddresses;
  })
  .catch(err => {
      return Promise.reject(err);
  });
}

function checkForContracts(index='latest') {
  const block = web3.eth.getBlock(index);
  for (let i = 0; i < block.transactions.length; i += 1) {
    let transaction = web3.eth.getTransactionReceipt(block.transactions[i]);
    if (transaction.contractAddress !== null) {
      return contractAddress;
    }
  }
}

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
  initializeListeners(contractInstance);
  return deployedContract.address;
}

function initializeListeners(contractInstance) {
  const listenerList = ['PaymentReceived', 'PaymentGiven',
    'ProposalFulfilled', 'PromiseMade', 'FundingGiven', 'AgentVerified'];

  for (let i = 0; i < listenerList.length; i += 1) {
    let listener = currentContractInstance[listenerList[i]]();
    listener.watch((err, result) => {
      refreshFields();
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
  /*
  PaymentReceived null { logIndex: 1,
  transactionIndex: 0,
  transactionHash: '0x1ebc0d205cab7ad189ec88aa69825e0077a7f92e7235b1a06fcd440c9bbd2fc8',
  blockHash: '0x734b9910c373c33b29ba7bb31075517783c4737aec221938ac531df2e218ac3f',
  blockNumber: 2,
  address: '0xf7c366b69d43b16b7dfc3361b1363f94d49c785b',
  type: 'mined',
  event: 'PaymentReceived',
  args: 
     { addr: '0xe77456f5fe11db2015377245f283216f60c90af8',
       amount: BigNumber { s: 1, e: 0, c: [Array] }
     }
  }
  */
}

/*
 * Eric's four functions here. Interfaces with four kind of users.
 * Each use case attaches to some of CDot's functions that interact with the blockchain. 
*/
function addAgent(){
  return promise(userAddress)
  .then(() => {
   alert(userAddress + " was successfully added as a new agent.");
  })
  .catch(err => {
    console.log(err);
    alert('Unable to add agent at this time.');
  })
}

function addVerifier(){
  alert("A verifier is added");
}

function addContract(){
  const proposal = $("#proposal").val();
  const numThreshold = parseInt($("#numThreshold").val());
  const stakeAmount = parseInt($("#stakeAmount").val());
  const verifiers = $("#verifiers").val().split(",").map(x => $.trim(x))
  return createContract(proposal, verifiers, numThreshold, stakeAmount)
  .then(contractAddress => {
    alert('A new contract was successfully added at address: ' + contractAddress);
  })
  .catch(err => {
    console.log(err);
    alert('Unable to add contract at this time.')
  })
}

function addFunds(funding){
  const funds = parseInt($("#fundsAdded").val());
  fund(userAddress, funds)
  .then(() => {
    alert('Successfully added ' + funds + ' wei to the bounty.');
  })
  .catch(err => {
    console.log(err);
    alert('Unable to add funds at this time.');
  })
}

function fund(userAddress, funding, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.fund({ from: userAddress, gas, value: funding},
      function(err, result) {
      console.log(err, result);
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function promise(userAddress, gas=100000) {
  const stakeAmount = currentContractInstance.stakeAmount.call();
  return new Promise((resolve, reject) => {
    currentContractInstance.promise({ from: userAddress, gas, value: stakeAmount },
      function(err, result) {
      console.log(err, result);
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
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

function disburse(userAddress, gas=100000) {
  return new Promise((resolve, reject) => {
    currentContractInstance.disburse({ from: userAddress, gas },
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



