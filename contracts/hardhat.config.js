require("@nomiclabs/hardhat-ethers")
require("./tasks/deploy.js")
require("dotenv").config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.13",
  paths: {
    sources: "./src/flat"
  },
  networks: {
    arbitrumTestnet: {
      url: "https://rinkeby.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
