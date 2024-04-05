import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumberish, Signer } from 'ethers';
import { SbeeToken, SbeeTokenClaim } from '../typechain-types';

describe('SbeeTokenClaim', function () {
  let token: SbeeToken;
  let claimContract: SbeeTokenClaim;
  let signers: Signer[],
    owner: Signer,
    claimSigner: Signer,
    user1: Signer,
    user2: Signer,
    user3: Signer;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory('SbeeToken');
    token = await Token.deploy(ethers.parseUnits('88880000000', 18));

    console.log('token deployed', token.target);

    await token.setRule(
      false,
      '0xb74eE901c2B0A04D75d38f7f4722e8a848E613B9',
      0,
      0
    );

    signers = await ethers.getSigners();
    owner = signers[0];
    claimSigner = signers[1];
    user1 = signers[2];
    user2 = signers[3];
    user3 = signers[3];

    await token.setRule(false, await owner.getAddress(), 0, 0);

    const SbeeTokenClaim = await ethers.getContractFactory('SbeeTokenClaim');
    claimContract = await SbeeTokenClaim.deploy(
      await claimSigner.getAddress(),
      token.target
    );

    console.log('claims deployed', claimContract.target);

    await token.transfer(
      claimContract.target,
      ethers.parseUnits('14142800000', 18)
    );
  });

  async function getSignature(
    account: string,
    developerAmount: BigNumberish,
    openSourceContributorAmount: BigNumberish,
    nftContractCreatorAmount: BigNumberish,
    gitcoinDonorAmount: BigNumberish,
    ensHolderAmount: BigNumberish,
    nftHolderAmount: BigNumberish,
    memeHolderAmount: BigNumberish
  ): Promise<string> {
    console.log('claim contract', claimContract.target);

    const domain = {
      name: 'SbeeTokenClaim',
      version: '1',
      chainId: 31337,
      verifyingContract: claimContract.target.toString(),
    };

    const types = {
      ClaimOptions: [
        { name: 'account', type: 'address' },
        { name: 'developerAmount', type: 'uint256' },
        { name: 'openSourceContributorAmount', type: 'uint256' },
        { name: 'nftContractCreatorAmount', type: 'uint256' },
        { name: 'gitcoinDonorAmount', type: 'uint256' },
        { name: 'ensHolderAmount', type: 'uint256' },
        { name: 'nftHolderAmount', type: 'uint256' },
        { name: 'memeHolderAmount', type: 'uint256' },
      ],
    };

    const value = {
      account,
      developerAmount: developerAmount.toString(),
      openSourceContributorAmount: openSourceContributorAmount.toString(),
      nftContractCreatorAmount: nftContractCreatorAmount.toString(),
      gitcoinDonorAmount: gitcoinDonorAmount.toString(),
      ensHolderAmount: ensHolderAmount.toString(),
      nftHolderAmount: nftHolderAmount.toString(),
      memeHolderAmount: memeHolderAmount.toString(),
    };

    return await claimSigner.signTypedData(domain, types, value);
  }

  describe('Claiming tokens', function () {
    it('should not allow claim if claimActive is false', async function () {
      await claimContract.connect(owner).setClaimActive(false);

      const developerAmount = ethers.parseUnits('1000', 18);
      const signature = await getSignature(
        await user2.getAddress(),
        developerAmount,
        0,
        0,
        0,
        0,
        0,
        0
      );

      await expect(
        claimContract
          .connect(user2)
          .claim(developerAmount, 0, 0, 0, 0, 0, 0, signature)
      ).to.be.revertedWith('Claiming is not currently allowed');
    });

    it('should allow a user to claim tokens when active and signature is valid', async function () {
      await claimContract.connect(owner).setClaimActive(true);

      await claimContract
        .connect(owner)
        .setOption(
          0,
          '2944000000000000000000000000',
          0,
          5888,
          0,
          '500000000000000000000000'
        );

      const developerAmount = ethers.parseUnits('500000', 18);
      const openSourceContributorAmount = '0';
      const nftContractCreatorAmount = '0';
      const gitcoinDonorAmount = '0';
      const ensHolderAmount = '0';
      const nftHolderAmount = '0';
      const memeHolderAmount = '0';

      const totalAmount = developerAmount;

      console.log(developerAmount.toString());
      console.log(await user1.getAddress());

      const signature = await getSignature(
        await user1.getAddress(),
        developerAmount,
        openSourceContributorAmount,
        nftContractCreatorAmount,
        gitcoinDonorAmount,
        ensHolderAmount,
        nftHolderAmount,
        memeHolderAmount
      );

      await expect(
        claimContract
          .connect(user1)
          .claim(
            developerAmount,
            openSourceContributorAmount,
            nftContractCreatorAmount,
            gitcoinDonorAmount,
            ensHolderAmount,
            nftHolderAmount,
            memeHolderAmount,
            signature
          )
      )
        .to.emit(claimContract, 'TokensClaimed')
        .withArgs(await user1.getAddress(), [
          developerAmount,
          openSourceContributorAmount,
          nftContractCreatorAmount,
          gitcoinDonorAmount,
          ensHolderAmount,
          nftHolderAmount,
          memeHolderAmount,
        ]);

      const finalBalance = await token.balanceOf(await user1.getAddress());
      console.log(finalBalance);
      expect(finalBalance).to.equal(totalAmount);
    });
  });

  describe('SbeeTokenClaim limit enforcement', function () {
    it('should not allow a user to claim more than the maximum for a single option', async function () {
      await claimContract.connect(owner).setClaimActive(true);

      // Assuming the max claimable amount for the Developer option is 500000
      const maxClaimAmount = ethers.parseUnits('500000', 18);
      const overClaimAmount = maxClaimAmount + ethers.parseUnits('1', 18); // Exceeding the limit by 1

      await claimContract.connect(owner).setOption(
        0, // OptionType.Developer
        ethers.parseUnits('1000000', 18), // totalSupply
        0, // claimedSupply
        100, // maxClaimableUsers
        0, // claimedUsers
        maxClaimAmount // maxClaimableAmount
      );

      const signature = await getSignature(
        await user1.getAddress(),
        overClaimAmount,
        0,
        0,
        0,
        0,
        0,
        0
      );

      // Attempt to claim more than the maxClaimAmount for Developer option
      await expect(
        claimContract
          .connect(user1)
          .claim(overClaimAmount, 0, 0, 0, 0, 0, 0, signature)
      ).to.be.revertedWith('Claim amount exceeds limit or already claimed');
    });

    it('should enforce limits for multiple claims across different options', async function () {
      await claimContract.connect(owner).setClaimActive(true);

      const developerAmount = ethers.parseUnits('300000', 18); // within limit
      const openSourceAmount = ethers.parseUnits('200000', 18); // within limit

      // Set options with different limits
      await claimContract.connect(owner).setOption(
        0, // Developer
        ethers.parseUnits('1000000', 18),
        0,
        100,
        0,
        ethers.parseUnits('500000', 18)
      );
      await claimContract.connect(owner).setOption(
        1, // OpenSourceContributor
        ethers.parseUnits('500000', 18),
        0,
        100,
        0,
        ethers.parseUnits('200000', 18)
      );

      const signature = await getSignature(
        await user3.getAddress(),
        developerAmount,
        openSourceAmount,
        0,
        0,
        0,
        0,
        0
      );

      // User1 claims under the limit for both Developer and OpenSourceContributor options
      await expect(
        claimContract
          .connect(user3)
          .claim(developerAmount, openSourceAmount, 0, 0, 0, 0, 0, signature)
      )
        .to.emit(claimContract, 'TokensClaimed')
        .withArgs(await user3.getAddress(), [
          developerAmount,
          openSourceAmount,
          0,
          0,
          0,
          0,
          0,
        ]);

      // Now try to claim again which should fail due to limit reached
      const newSignature = await getSignature(
        await user3.getAddress(),
        developerAmount,
        openSourceAmount,
        0,
        0,
        0,
        0,
        0
      );

      await expect(
        claimContract
          .connect(user3)
          .claim(developerAmount, openSourceAmount, 0, 0, 0, 0, 0, newSignature)
      ).to.be.revertedWith('Claim amount exceeds limit or already claimed');
    });
  });

  describe('SbeeTokenClaim max users enforcement', function () {
    it('should enforce the maximum number of users that can claim an option', async function () {
      await claimContract.connect(owner).setClaimActive(true);

      const maxUsers = 2; // Setting a small number for testing
      const claimAmount = ethers.parseUnits('100000', 18); // Amount each user will claim

      // Set the Developer option with a maxUsers limit
      await claimContract.connect(owner).setOption(
        0, // Developer
        ethers.parseUnits('1000000', 18), // totalSupply
        0, // claimedSupply
        maxUsers, // maxClaimableUsers
        0, // claimedUsers
        claimAmount // maxClaimableAmount per user
      );

      const userAddresses = [
        await owner.getAddress(),
        await claimSigner.getAddress(),
      ];

      // Two users claim successfully
      for (let i = 0; i < maxUsers; i++) {
        const signature = await getSignature(
          userAddresses[i],
          claimAmount,
          0,
          0,
          0,
          0,
          0,
          0
        );

        await expect(
          claimContract
            .connect(signers[i])
            .claim(claimAmount, 0, 0, 0, 0, 0, 0, signature)
        )
          .to.emit(claimContract, 'TokensClaimed')
          .withArgs(userAddresses[i], [claimAmount, 0, 0, 0, 0, 0, 0]);
      }

      // Another user attempts to claim, which should fail due to max users limit
      const anotherUser = signers[maxUsers]; // Assuming this signer is different from the first two
      const signature = await getSignature(
        await anotherUser.getAddress(),
        claimAmount,
        0,
        0,
        0,
        0,
        0,
        0
      );

      await expect(
        claimContract
          .connect(anotherUser)
          .claim(claimAmount, 0, 0, 0, 0, 0, 0, signature)
      ).to.be.revertedWith('Claim amount exceeds limit or already claimed');
    });
  });
});
