require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.25",
  networks: {
    hardhat: {},
    // Red Mumbai (retrocompatible con configuración anterior)
    mumbai: {
      // Soportar tanto MUMBAI_RPC_URL (nuevo) como MUMBAI_URL (legacy)
      url:
        process.env.MUMBAI_RPC_URL ||
        process.env.MUMBAI_URL ||
        "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
    },
    // Red Amoy (desde hardhat.config.simple.cjs)
    amoy: {
      url:
        process.env.AMOY_RPC_URL ||
        "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
