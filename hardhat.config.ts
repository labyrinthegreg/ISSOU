import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  solidity: "0.8.20",
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  },
};

export default config;
