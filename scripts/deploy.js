// scripts/deploy.js
async function main() {
    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();

    await crowdFunding.deployed();

    console.log("CrowdFunding contract deployed to:", crowdFunding.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
