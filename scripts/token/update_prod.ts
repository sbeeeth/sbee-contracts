import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  const contractAddress = '0x7Ae0f19D2aE2f490e710579284A58000d4E8C85f';
  const contract = await ethers.getContractAt('SbeeTokenxxx', contractAddress);

  await contract.setRule(
    false,
    '0xb74eE901c2B0A04D75d38f7f4722e8a848E613B9',
    0,
    0
  );

  console.log('Contract updated:', contract.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
