import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.0',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 30,
      },
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || '',
      accounts:
        process.env.TESTNET_PRIVATE_KEY !== undefined
          ? [process.env.TESTNET_PRIVATE_KEY]
          : [],
    },
    mainnet: {
      url: process.env.MAINNET_URL || '',
      accounts:
        process.env.MAINNET_PRIVATE_KEY !== undefined
          ? [process.env.MAINNET_PRIVATE_KEY]
          : [],
    },
    base: {
      url: process.env.BASE_URL || '',
      accounts:
        process.env.BASE_TEST_PRIVATE_KEY !== undefined
          ? [process.env.BASE_TEST_PRIVATE_KEY]
          : [],
    },
    arbtrium: {
      url: process.env.ARBTRIUM_URL || '',
      accounts:
        process.env.ARBTRIUM_TEST_PRIVATE_KEY !== undefined
          ? [process.env.ARBTRIUM_TEST_PRIVATE_KEY]
          : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: false,
  },
  mocha: {
    timeout: 800000000000,
  },
};

export default config;
