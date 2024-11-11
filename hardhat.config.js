require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

// Directly define the API URL and Private Key here
const API_URL = "https://volta-rpc.energyweb.org";
const PRIVATE_KEY = "b9bf7aed5350cd6e079c6f757a9f69038614f96973408f6a16db91464d4c52fe";

module.exports = {
  solidity: "0.8.0",
  networks: {
    volta: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
