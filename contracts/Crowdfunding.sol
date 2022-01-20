// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract CrowdfundingFactory {
    address[] public deployedCrowdfundingCampaigns;

    function deployNewCrowdfundingCampaign(
        uint256 minimalCampaignContributionWei
    ) external {
        address deployedCampaignAddress = address(
            new CrowdfundingCampaign(minimalCampaignContributionWei, msg.sender)
        );

        deployedCrowdfundingCampaigns.push(deployedCampaignAddress);
    }

    function getAllDeployedCrowdfundingCampaigns()
        external
        view
        returns (address[] memory)
    {
        return deployedCrowdfundingCampaigns;
    }
}

contract CrowdfundingCampaign {
    address public founderAddress;
    uint256 public minimalContributionWei;

    struct SpendingRequest {
        string description;
        uint256 value;
        address payable recipientAddress;
        uint256 approvalCount;
        bool consumed;
    }

    uint256 public numberOfRequests;
    uint256 public numberOfContributors;

    mapping(address => bool) public contributorsRegistry;
    mapping(uint256 => mapping(address => bool)) public approvalsRegistry;
    mapping(uint256 => SpendingRequest) public spendingRequestsRegistry;

    event InfoAddressAction(address subjectAddress, string value);

    constructor(
        uint256 minimalCampaignContributionWei,
        address campaignFounderAddress
    ) {
        minimalContributionWei = minimalCampaignContributionWei;
        founderAddress = campaignFounderAddress;
        emit InfoAddressAction(
            msg.sender,
            "Has started a new crowdfunding project"
        );
    }

    // Modifiers //

    modifier founderRestricted() {
        require(
            msg.sender == founderAddress,
            "Only the founder can execute this action"
        );
        _;
    }

    // Private //

    function verifyContributionEligibility(uint256 contributionValue)
        private
        view
    {
        require(
            contributionValue >= minimalContributionWei,
            "Contribution amount less than minimal contribution for this campaign"
        );
    }

    function registerContribution(address contributorAddress) private {
        contributorsRegistry[contributorAddress] = true;
        numberOfContributors++;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address recipientAddress
    ) private returns (SpendingRequest memory newSpendingRequest) {
        numberOfRequests++;

        return
            SpendingRequest({
                description: description,
                value: value,
                recipientAddress: payable(recipientAddress),
                consumed: false,
                approvalCount: 0
            });
    }

    function verifyApprovalEligibility(
        address approverAddress,
        uint256 requestNumber
    ) private view {
        require(contributorsRegistry[approverAddress]);
        require(!approvalsRegistry[requestNumber][approverAddress]);
    }

    function registerApproval(address approverAddress, uint256 requestNumber)
        private
    {
        spendingRequestsRegistry[requestNumber].approvalCount++;
        approvalsRegistry[requestNumber][approverAddress] = true;
    }

    function verifyRequestConsumptionEligibility(
        SpendingRequest storage requestToConsume
    ) private view {
        require(
            !requestToConsume.consumed,
            "This request has already been consumed"
        );

        require(
            requestToConsume.approvalCount > (numberOfContributors / 2),
            "This request did not win the majority"
        );
    }

    function consumeSpendingRequest(SpendingRequest storage requestToConsume)
        private
    {
        requestToConsume.consumed = true;
        requestToConsume.recipientAddress.transfer(requestToConsume.value);
    }

    // Public //

    function contributeToTheCampaign() external payable {
        verifyContributionEligibility(msg.value);
        registerContribution(msg.sender);
    }

    function createSpendingRequest(
        string memory description,
        uint256 value,
        address recipientAddress
    ) external founderRestricted {
        SpendingRequest memory newSpendingRequest = createRequest(
            description,
            value,
            recipientAddress
        );

        spendingRequestsRegistry[numberOfRequests] = newSpendingRequest;
    }

    function approveRequest(uint256 requestNumber) external {
        address approverAddress = msg.sender;

        verifyApprovalEligibility(approverAddress, requestNumber);
        registerApproval(approverAddress, requestNumber);
    }

    function consumeRequest(uint256 requestNumber)
        external
        payable
        founderRestricted
    {
        SpendingRequest storage requestToConsume = spendingRequestsRegistry[
            requestNumber
        ];

        verifyRequestConsumptionEligibility(requestToConsume);
        consumeSpendingRequest(requestToConsume);
    }
}
