import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const contract = await ethers.deployContract('SbeeTokenxxxx', [
    BigInt(88880000000000000000000000000),
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
