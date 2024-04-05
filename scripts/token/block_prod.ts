import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  const contractAddress = '0x7Ae0f19D2aE2f490e710579284A58000d4E8C85f';
  const contract = await ethers.getContractAt('SbeeTokenXXX', contractAddress);

  await contract.blacklist('0x74055870EC70D4C2bA7E6c0A55b7dbec21e1a592', false);

  console.log('Contract updated:', contract.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
