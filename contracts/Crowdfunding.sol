// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
        uint256[] donations;
        uint256[] donationTimestamps; // Store timestamps of donations
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 campaignId, address indexed owner, uint256 target, uint256 deadline);
    event DonationReceived(uint256 campaignId, address indexed donator, uint256 amount, uint256 timestamp);
    event Withdrawn(uint256 campaignId, address indexed owner, uint256 amount);
    event Refunded(uint256 campaignId, address indexed donator, uint256 amount);

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public returns (uint256) {
        require(_target > 0, "Target must be greater than zero.");
        require(_deadline > block.timestamp, "Deadline should be in the future.");

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;

        emit CampaignCreated(numberOfCampaigns, msg.sender, _target, _deadline);

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed.");
        require(msg.value > 0, "Donation must be greater than zero.");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.donationTimestamps.push(block.timestamp); // Store timestamp
        campaign.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value, block.timestamp);
    }

    function withdraw(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can withdraw funds.");
        require(block.timestamp >= campaign.deadline, "Cannot withdraw before the deadline.");
        require(campaign.amountCollected >= campaign.target, "Campaign not fully funded.");

        uint256 amount = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send funds.");

        emit Withdrawn(_id, campaign.owner, amount);
    }

    // Function to handle automatic refunds
    function checkRefunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.deadline, "Campaign is still active.");
        require(campaign.amountCollected < campaign.target, "Campaign was successful, no refunds allowed.");

        for (uint256 i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 donationAmount = campaign.donations[i];

            // Refund the donation
            (bool sent, ) = payable(donator).call{value: donationAmount}("");
            require(sent, "Refund failed.");

            emit Refunded(_id, donator, donationAmount);
        }

        // Reset the campaign to avoid re-refunds
        campaign.amountCollected = 0;
        delete campaign.donators;
        delete campaign.donations;
        delete campaign.donationTimestamps;
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations, campaigns[_id].donationTimestamps);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
}
