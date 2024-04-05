import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  const contractAddress = '0x76E15082835f892592AF3Fc51FbDCaE47c79aada';
  const contract = await ethers.getContractAt(
    'SbeeTokenClaim',
    contractAddress
  );

  await contract.setOption(
    0,
    '2944000000000000000000000000',
    0,
    5888,
    0,
    '500000000000000000000000'
  );

  await contract.setOption(
    1,
    '2944000000000000000000000000',
    0,
    5888,
    0,
    '500000000000000000000000'
  );

  await contract.setOption(
    2,
    '2355200000000000000000000000',
    0,
    5888,
    0,
    '400000000000000000000000'
  );

  await contract.setOption(
    3,
    '1177600000000000000000000000',
    0,
    5888,
    0,
    '200000000000000000000000'
  );

  await contract.setOption(
    4,
    '944400000000000000000000000',
    0,
    18888,
    0,
    '50000000000000000000000'
  );
  await contract.setOption(
    5,
    '1888800000000000000000000000',
    0,
    18888,
    0,
    '100000000000000000000000'
  );

  await contract.setOption(
    6,
    '1888800000000000000000000000',
    0,
    18888,
    0,
    '100000000000000000000000'
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
