const hre = require("hardhat");

async function main() {
  // Compile the contract
  await hre.run('compile');

  const fundingGoal = ethers.utils.parseEther("1"); // Set funding goal to 1 ETH
  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(fundingGoal);

  await crowdfunding.deployed();
  console.log("Crowdfunding deployed to:", crowdfunding.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
