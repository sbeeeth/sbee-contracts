import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const contract = await ethers.deployContract('SbeeTokenClaim', [
    deployer.address,
    '0x45C021e937f6234C654DEa95Ca415D080D0A5589',
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
