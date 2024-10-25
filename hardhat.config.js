require("dotenv").config(); // Load environment variables
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    volta: {
      url: "https://volta-rpc.energyweb.org", // Volta RPC URL
      accounts: [`0x${process.env.PRIVATE_KEY}`] // Use the private key from .env
    }
  }
};
  