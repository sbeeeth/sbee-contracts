**SBEE Airdrop Claim Contract**

  
Welcome to the SBEE Airdrop Claim Contract repository! This contract is at the heart of our airdrop distribution, designed to reward our community members for their contributions and engagement. In the spirit of open source and inclusivity, we’re excited to share this contract with the wider community. We hope it can serve as a resource or inspiration for other projects looking to implement similar airdrop mechanisms.

**Overview**

The SBEE Airdrop Claim Contract is a smart contract developed for the Ethereum blockchain, utilizing the ERC-20 token standard. It’s designed to facilitate the distribution of SBEE tokens to eligible participants in our airdrop campaigns.

**Features**

- Eligibility Verification: Ensures only qualified addresses can claim the airdrop.

- Claim Function: Allows eligible participants to claim their allocated SBEE tokens.

- Transparency: All transactions and allocations are transparent and verifiable on the blockchain.

**Getting Started**

To interact with the contract or integrate it into your project, follow these steps:

1.  **Install Dependencies:**

    yarn install

2.  **Compile the Contract:**

    npx hardhat compile

3.  **Deploy the Contract:**

    npx hardhat run scripts/claim/deploy_prod.ts --network mainnet

4.  **Interact with the Contract:**

    npx hardhat run scripts/claim/update_prod.ts --network mainnet

Contributing

We welcome contributions from the community! If you have improvements or bug fixes (such as anti-sybil mechanism on our wishlist), please feel free to fork this repository, make your changes, and submit a pull request. Together, we can make the SBEE Airdrop Claim Contract even better. If you are interested in building us on other projects such as games and public goods, please DM us on Twitter https://twitter.com/sbeecoineth/

License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

Disclaimer

This contract is provided as-is with no warranty. Users should review the code and conduct thorough testing before deploying it for production use.
