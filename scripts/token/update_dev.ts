import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  const contractAddress = '0x45C021e937f6234C654DEa95Ca415D080D0A5589';
  const contract = await ethers.getContractAt('SbeeToken', contractAddress);

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
