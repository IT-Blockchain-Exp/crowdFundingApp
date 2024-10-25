// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public owner;
    uint256 public fundingGoal;
    uint256 public totalContributions;
    mapping(address => uint256) public contributions;
    bool public fundingSuccessful;

    event ContributionReceived(address indexed contributor, uint256 amount);
    event FundingWithdrawn(uint256 amount);

    constructor(uint256 _fundingGoal) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
        fundingSuccessful = false;
    }

    function contribute() public payable {
        require(!fundingSuccessful, "Funding has already been successful.");
        require(msg.value > 0, "Contribution must be greater than zero.");
        
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;

        emit ContributionReceived(msg.sender, msg.value);

        if (totalContributions >= fundingGoal) {
            fundingSuccessful = true;
        }
    }

    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw funds.");
        require(fundingSuccessful, "Funding goal not reached.");
        
        uint256 amount = address(this).balance;
        payable(owner).transfer(amount);
        emit FundingWithdrawn(amount);
    }

    function getCurrentBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFundingGoal() public view returns (uint256) {
        return fundingGoal;
    }

    function getTotalContributions() public view returns (uint256) {
        return totalContributions;
    }

    function getContributorContribution(address contributor) public view returns (uint256) {
        return contributions[contributor];
    }
}
