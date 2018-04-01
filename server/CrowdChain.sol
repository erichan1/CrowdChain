pragma solidity ^0.4.18;

contract CrowdChain {

    struct Agent {
        bool verified;
        bool paid;
        bool initialized;
    }
    struct Funder {
        uint funding;
        bool initialized;
    }
    struct Verifier {
        bool isTrusted;
        bool initialized;
    }

    address public chairperson;
    mapping(address => Agent) public agents;
    mapping(address => Verifier) public verifiers;
    mapping(address => Funder) public funders;

    //number of people that have joined this cause. 
    uint public numJoined;

    // number of people to activate cooperation
    uint public numThreshold;

    //amount of money available to this crowdchain
    uint public bounty;

    //the goal of this crowdchain. ex: Join us in solving LA traffic!
    string public proposal;

    // whether or not threshold has been met
    bool public isFulfilled;

    // stake amount
    uint public stakeAmount;

    // any payment received by the contract
    event PaymentReceived(address addr, uint amount);

    // any payment given by the contract
    event PaymentGiven(address addr, uint amount);

    // the promise threshold has been met and the proposal is fulfilled
    event ProposalFulfilled();

    // promise made
    event PromiseMade(address addr);

    // funding given by an funder
    event FundingGiven(address addr, uint amount);

    // an agent is verified by a verifier
    event AgentVerified(address verifier, address verified);

    function CrowdChain(
        string _proposal,
        uint _numThreshold,
        uint _stakeAmount, 
        address[] _verifiers
    ) public {
        chairperson = msg.sender;
        proposal = _proposal;
        numJoined = 0;
        numThreshold = _numThreshold;
        stakeAmount = _stakeAmount;
        isFulfilled = false;
        bounty = 0;

        // add trusted verifiers
        for (uint i = 0; i < _verifiers.length; i++) {
            Verifier storage verifier = verifiers[_verifiers[i]];
            verifier.isTrusted = true;
            verifier.initialized = true;
        }
    }

    modifier onlyChairperson() {
        require(msg.sender == chairperson);
        _;
    }

    modifier onlyVerifier() { 
        require(verifiers[msg.sender].initialized); 
        _;
    }

    modifier onlyFunder() { 
        require(funders[msg.sender].initialized); 
        _;
    }

    modifier onlyAgent() {
        require(agents[msg.sender].initialized);
        _;
    }

    modifier notAgent() {
        require(!agents[msg.sender].initialized);
        _;
    }

    modifier fulfilledState(bool desiredState) {
        require (isFulfilled == desiredState);
        _;
    }

    function fund() public payable fulfilledState(false) {
        Funder storage funder = funders[msg.sender];
        if (!funders[msg.sender].initialized) {
            funders[msg.sender].funding = 0;
            funder.initialized = true;
        }
        funders[msg.sender].funding += msg.value;
        bounty += msg.value;

        emit FundingGiven(msg.sender, msg.value);
        emit PaymentReceived(msg.sender, msg.value);
    }

    function refund() public onlyFunder fulfilledState(false) {
        msg.sender.transfer(funders[msg.sender].funding);

        emit PaymentGiven(msg.sender, funders[msg.sender].funding);

        bounty -= funders[msg.sender].funding;
        delete funders[msg.sender];
    }

    function promise() public payable notAgent fulfilledState(false) {
        require(msg.value >= stakeAmount);
        Agent storage agent = agents[msg.sender];
        agent.verified = false;
        agent.paid = false;
        agent.initialized = true;
        numJoined += 1;

        if (numJoined >= numThreshold) {
            setFulfilled(true);
        }

        emit PaymentReceived(msg.sender, msg.value);
        emit PromiseMade(msg.sender);
    }

    function renege()
        public
        onlyAgent
        fulfilledState(false)
        returns (uint)
    {
        msg.sender.transfer(stakeAmount);
        delete agents[msg.sender];
        numJoined -= 1;

        emit PaymentGiven(msg.sender, stakeAmount);

        return stakeAmount;
    }

    function verify(address _agentAddress)
        public
        onlyVerifier
        fulfilledState(true)
    {
        require(agents[_agentAddress].initialized);
        agents[_agentAddress].verified = true;

        emit AgentVerified(msg.sender, _agentAddress);
    }

    function setFulfilled (bool _isFulfilled) private {
        isFulfilled = _isFulfilled;
    }

    function disburse()
        public
        onlyAgent
        fulfilledState(true)
        returns (uint)
    {
        require(agents[msg.sender].initialized && !agents[msg.sender].paid);
        msg.sender.transfer(bounty / numJoined + stakeAmount);
        agents[msg.sender].paid = true;

        emit PaymentGiven(msg.sender, (bounty / numJoined + stakeAmount));

        return (bounty / numJoined + stakeAmount);
    }

    function addVerifier(address _verifierAddress) 
        public
        onlyChairperson 
    {
        Verifier storage verifier = verifiers[_verifierAddress];
        verifier.isTrusted = true;
        verifier.initialized = true;
    }

    function deleteVerifier(address _verifierAddress) 
        public onlyChairperson
    {
        delete verifiers[_verifierAddress];
    }

    function getProposal() view public returns (string) {
        return proposal;
    }

    function statusUpdate() view public 
        returns (uint, uint, uint, string, bool, uint)
    {
        return (numJoined, numThreshold, bounty, proposal, isFulfilled,
            stakeAmount);
    }

    function findAgent()
        view
        public
        onlyAgent
        returns (bool, bool)
    {
        return (agents[msg.sender].verified, agents[msg.sender].paid);
    }

    function findFunder()
        view
        public
        onlyFunder
        returns (uint)
    {
        return funders[msg.sender].funding;
    }

    function findVerifier()
        view
        public
        onlyVerifier
        returns (bool)
    {
        return verifiers[msg.sender].isTrusted;
    }

    function getChairperson() view public returns (address) {
        return chairperson;
    }
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