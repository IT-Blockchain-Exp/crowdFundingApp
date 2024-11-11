import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { ethers } from 'ethers';
import CrowdFunding from './CrowdFunding.json';

function App() {
    const [campaigns, setCampaigns] = useState([]);
    const [donationAmount, setDonationAmount] = useState({});
    const [donationRefundAddress, setDonationRefundAddress] = useState({});
    const contractAddress = "0x42db853c360f1f2dfbae8d79fd43b167f92aef40"; // Replace with your contract address

    const fetchCampaigns = useCallback(async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const crowdFundingContract = new ethers.Contract(contractAddress, CrowdFunding.abi, signer);

            const allCampaigns = await crowdFundingContract.getCampaigns();
            setCampaigns(allCampaigns);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            alert("Failed to fetch campaigns.");
        }
    }, [contractAddress]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleCreateCampaign = async (event) => {
        event.preventDefault();
        const title = event.target.title.value;
        const description = event.target.description.value;
        const target = ethers.utils.parseEther(event.target.target.value);
        const deadline = Math.floor(new Date(event.target.deadline.value).getTime() / 1000);
        const image = event.target.image.value;

        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const crowdFundingContract = new ethers.Contract(contractAddress, CrowdFunding.abi, signer);

            const transaction = await crowdFundingContract.createCampaign(
                title,
                description,
                target,
                deadline,
                image,
                { gasLimit: 3000000 }
            );

            await transaction.wait();
            fetchCampaigns();
            alert("Campaign created successfully!");
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign.");
        }
    };

    const handleDonate = async (campaignIndex) => {
        const amount = donationAmount[campaignIndex];
        const refundAddress = donationRefundAddress[campaignIndex];

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert("Please enter a valid donation amount.");
            return;
        }
        if (!refundAddress) {
            alert("Please enter a valid refund address.");
            return;
        }

        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const crowdFundingContract = new ethers.Contract(contractAddress, CrowdFunding.abi, signer);

            const transaction = await crowdFundingContract.donateToCampaign(campaignIndex, refundAddress, {
                value: ethers.utils.parseEther(amount.toString()),
                gasLimit: 3000000
            });

            await transaction.wait();
            fetchCampaigns();
            alert("Donation successful!");
        } catch (error) {
            console.error("Error donating:", error);
            alert("Failed to donate.");
        }
    };

    const handleCheckRefunds = async (campaignIndex) => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const crowdFundingContract = new ethers.Contract(contractAddress, CrowdFunding.abi, signer);

            const transaction = await crowdFundingContract.checkRefunds(campaignIndex, {
                gasLimit: 3000000
            });
            await transaction.wait();
            fetchCampaigns();
            alert("Refunds processed successfully for campaign " + campaignIndex);
        } catch (error) {
            console.error("Error processing refunds:", error);
            alert("Failed to process refunds.");
        }
    };

    return (
        <div className="App">
            <h1>Crowdfunding DApp</h1>
            <form onSubmit={handleCreateCampaign}>
                <input type="text" name="title" placeholder="Campaign Title" required />
                <textarea name="description" placeholder="Description" required></textarea>
                <input type="number" name="target" placeholder="Target Amount (ETH)" required />
                <input type="datetime-local" name="deadline" required />
                <button type="submit">Create Campaign</button>
            </form>

            <div>
    <h2>Active Campaigns</h2>
    {campaigns.length === 0 ? (
        <p className="no-campaigns">No campaigns available.</p>
    ) : (
        campaigns.map((campaign, index) => (
            <div key={index} className="campaign-card">
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <div className="campaign-details">
                    <p><strong>Target:</strong> {ethers.utils.formatEther(campaign.target)} ETH</p>
                    <p><strong>Collected:</strong> {ethers.utils.formatEther(campaign.amountCollected)} ETH</p>
                    <p><strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                </div>
                <input
                    type="number"
                    placeholder="Donation Amount (ETH)"
                    onChange={(e) => setDonationAmount((prev) => ({ ...prev, [index]: e.target.value }))}
                    className="donation-input"
                />
                <input
                    type="text"
                    placeholder="Your Refund Address"
                    onChange={(e) => setDonationRefundAddress((prev) => ({ ...prev, [index]: e.target.value }))}
                    className="donation-input"
                />
                <button onClick={() => handleDonate(index)} className="action-button">Donate</button>
                {Date.now() / 1000 > campaign.deadline && campaign.amountCollected < campaign.target && (
                    <button onClick={() => handleCheckRefunds(index)} className="action-button">Check Refunds</button>
                )}
            </div>
        ))
    )}
</div>

        </div>
    );
}

export default App;
