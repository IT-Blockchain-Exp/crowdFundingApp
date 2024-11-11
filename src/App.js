import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { ethers } from 'ethers';
import CrowdFunding from './CrowdFunding.json';

function App() {
    const [campaigns, setCampaigns] = useState([]);
    const [donationAmount, setDonationAmount] = useState({});
    const contractAddress = "0x8408918B209D60b56c90C3D16FcBa910126ADB0d"; // Replace with your contract address

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

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert("Please enter a valid donation amount.");
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

            // Pass only the campaignIndex and donation amount to the contract function
            const transaction = await crowdFundingContract.donateToCampaign(campaignIndex, {
                value: ethers.utils.parseEther(amount.toString()), // donation amount
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
                                <p>Amount Collected: {ethers.utils.formatEther(campaign.amountCollected)} ETH</p>
                                <p>Target: {ethers.utils.formatEther(campaign.target)} ETH</p>
                                <p>Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                            </div>
                            <input
                                type="number"
                                placeholder="Donation Amount (ETH)"
                                value={donationAmount[index] || ""}
                                onChange={(e) => setDonationAmount({ ...donationAmount, [index]: e.target.value })}
                            />
                            <button onClick={() => handleDonate(index)}>Donate</button>
                            <button onClick={() => handleCheckRefunds(index)}>Check Refunds</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
