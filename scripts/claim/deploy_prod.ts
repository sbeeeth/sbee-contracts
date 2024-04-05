import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const contract = await ethers.deployContract('SbeeTokenClaim', [
    '0x889317E0E8E74d717C07C22bd65b714C7077e183',
    '0x7Ae0f19D2aE2f490e710579284A58000d4E8C85f',
  ]);

  await contract.waitForDeployment();

  console.log('Contract address:', contract.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
