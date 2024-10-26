require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();  // Load environment variables from .env file

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
    solidity: "0.8.0",
    networks: {
        volta: {
            url: API_URL,
            accounts: [`0x${PRIVATE_KEY}`]
        }
    }
};
