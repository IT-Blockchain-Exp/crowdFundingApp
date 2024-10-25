const hre = require("hardhat");

async function main() {
  const contractAddress = "0xd994C494F71d500a17aD23EcCB71552960eBA70a"; // Replace with your contract address
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = Crowdfunding.attach(contractAddress);

  // Example: Contribute to the campaign
  const [signer] = await hre.ethers.getSigners();
  const contributionAmount = hre.ethers.utils.parseEther("0.1"); // Contribute 0.1 ETH
  const tx = await crowdfunding.connect(signer).contribute({ value: contributionAmount });
  await tx.wait();
  console.log("Contribution successful!");

  // Example: Check current balance
  const currentBalance = await crowdfunding.getCurrentBalance();
  console.log("Current balance:", hre.ethers.utils.formatEther(currentBalance));

  // Example: Withdraw funds (only the owner can do this)
  // const withdrawTx = await crowdfunding.connect(owner).withdraw();
  // await withdrawTx.wait();
  // console.log("Funds withdrawn!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
