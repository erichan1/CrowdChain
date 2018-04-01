pragma solidity ^0.4.18;

contract CrowdChain {

    struct Agent {
        bool verified;
        bool paid;
    }
    struct Funder {
        uint value;
    }
    struct Verifier {
        bool isTrusted;
    }

    address chairperson;
    mapping(address => Agent) agents;
    mapping(address => Verifier) verifiers;
    mapping(address => Funder) funders;


    //number of people that have joined this cause. 
    uint public numJoined;

    // number of people to activate cooperation
    uint public numThreshold;

    //amount of money available to this crowdchain
    uint32 public money;

    //the goal of this crowdchain. ex: Join us in solving LA traffic!
    string public proposal;

    // whether or not threshold has been met
    bool public isFulfilled;

    // stake amount
    uint public stakeAmount;

    function CrowdChain(
        string _proposal,
        uint _numThreshold,
        uint _stakeAmount, 
        address[] _verifiers,
    ) public payable {
        chairperson = msg.sender;
        proposal = _proposal;
        numJoined = 0
        numThreshold = _numThreshold;
        stakeAmount = _stakeAmount
        isFulfilled = false;
        bounty = msg.value;

        // add trusted verifiers
        for (uint i = 0; i < _verifiers.length; i++) {
            Verifier storage verifier = verifiers[_verifiers[i]];
            verifier.isTrusted = true;
        }
    }

    modifier onlyChairperson() {
        require(msg.sender == chairperson);
        _;
    }

    modifier onlyVerifier() { 
        require (puverifiers[msg.sender].isValue); 
        _;
    }

    modifier onlyAgent() {
        require (agents[msg.sender].isValue);
        _;
    }

    modifier notAgent() {
        require (!agents[msg.sender].isValue);
        _;
    }

    modifier fulfilledState(bool desiredState) {
        require (isFulfilled == desiredState);
        _;
    }

    function fund() public payable fulfilledState(false) {
        if (!funders[msg.sender].isValue) {
            funders[msg.sender] = 0
        }
        funders[msg.sender] += msg.value;
        bounty += msg.value;
    }

    function refund() public onlyFunder fulfilledState(false) {
        msg.sender.transfer(funders[msg.sender].value);
        bounty -= funders[msg.sender].value;
        delete funders[msg.sender];
    }

    function promise() public payable notAgent fulfilledState(false) {
        Agent storage agent = agents[msg.sender];
        agent.verified = false;
        agent.paid = false;
        numJoined += 1;

        if (numJoined >= numThreshold) {
            setFulfilled(true);
        }
    }

    function renege() public onlyAgent fulfilledState(false) {
        msg.sender.transfer(stakeAmount);
        delete agents[msg.sender];
        numJoined -= 1;
    }

    function verify(address _agentAddress)
        public
        onlyVerifier
        fulfilledState(false)
    {
        require(agents[_agentAddress].isValue);
        agents[_agentAddress].verified = true;
    }

    function setFulfilled (bool _isFulfilled) private {
        isFulfilled = _isFulfilled;
    }

    function disburse()
        onlyAgent
        fulfilledState(true)
    {
        require(agents[msg.sender].isValue && !agents[msg.sender].paid);
        msg.sender.transfer(bounty / numJoined)
        agents[msg.sender].paid = true;
    }

    function addVerifier(address _verifierAddress) onlyChairperson {
        Verifier storage verifier = verifers[_verifiers[i]];
        verifier.isTrusted = true;
    }

    function deleteVerifier(address _verifierAddress) onlyChairperson {
        delete verifers[_verifiers[i]];
    }

    function getProposal() view public returns (string) {
        return proposal;
    }


/*
format of the smart contract

People:
    chairperson
        address
    funder
        number of funds inputted
    agents (address => Voter)
        reneged? (or just delete)
        verified
        disbursed
    validators (address[])
        address

Properties:

    numjoined
    numtotal
    pot money
    proposal
    isfulfilled -> closed 
    expiration
    stake amount
    stake money

Methods:
    __init__
        set properties, initial bounty, and validators
    fund (any)
    refund (only chairperson, refunds and revokes all)
    promise (stake, only if not fulfilled)
    reneg (return stake, only if not met yet)
    check completed (called for every promise, changes boolean)
    add validator (only chairperson)
    verify (can only be called by validator)
    disburse (only if verified, takes out money)
    cancel (chairperson only, return funds to all, only if not met yet)
*/