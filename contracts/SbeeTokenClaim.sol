// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract SbeeTokenClaim is Ownable, ReentrancyGuard, EIP712 {
    IERC20 public token;

    bool public claimActive = false;
    address public immutable CLAIM_SIGNER;
    string private constant SIGNING_DOMAIN = "SbeeTokenClaim";
    string private constant SIGNATURE_VERSION = "1";
    uint256 public eighteenZeros = eighteenZeros;

    struct Option {
        uint256 totalSupply;
        uint256 claimedSupply;
        uint256 maxClaimableUsers;
        uint256 claimedUsers;
        uint256 maxClaimableAmount;
    }

    mapping(uint256 => Option) public options;
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    enum OptionType {
        Developer,
        OpenSourceContributor,
        NftContractCreator,
        GitcoinDonor,
        EnsHolder,
        NftHolder,
        MemeHolder
    }

    struct ClaimOptions {
        address account;
        uint256 developerAmount;
        uint256 openSourceContributorAmount;
        uint256 nftContractCreatorAmount;
        uint256 gitcoinDonorAmount;
        uint256 ensHolderAmount;
        uint256 nftHolderAmount;
        uint256 memeHolderAmount;
    }

    event TokensClaimed(address account, uint256[] amounts);

    constructor(
        address claimSigner,
        address tokenAddress
    ) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        CLAIM_SIGNER = claimSigner;
        token = IERC20(tokenAddress);
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOA can call this function");
        _;
    }

    modifier canClaimTokens() {
        require(claimActive, "Claiming is not currently allowed");
        _;
    }

    function setClaimActive(bool _active) external onlyOwner {
        claimActive = _active;
    }

    function claim(
        uint256 developerAmount,
        uint256 openSourceContributorAmount,
        uint256 nftContractCreatorAmount,
        uint256 gitcoinDonorAmount,
        uint256 ensHolderAmount,
        uint256 nftHolderAmount,
        uint256 memeHolderAmount,
        bytes memory signature
    ) external nonReentrant canClaimTokens onlyEOA {
        ClaimOptions memory _options = ClaimOptions(
            msg.sender,
            developerAmount,
            openSourceContributorAmount,
            nftContractCreatorAmount,
            gitcoinDonorAmount,
            ensHolderAmount,
            nftHolderAmount,
            memeHolderAmount
        );

        require(
            _verify(_options, signature) == CLAIM_SIGNER,
            "Invalid signature"
        );

        uint256 totalAmount = developerAmount +
            openSourceContributorAmount +
            nftContractCreatorAmount +
            gitcoinDonorAmount +
            ensHolderAmount +
            nftHolderAmount +
            memeHolderAmount;

        require(
            canClaim(_options),
            "Claim amount exceeds limit or already claimed"
        );

        updateClaimedAmounts(_options);

        require(
            token.transfer(msg.sender, totalAmount),
            "Token transfer failed"
        );

        uint256[] memory amounts = new uint256[](7);
        amounts[0] = developerAmount;
        amounts[1] = openSourceContributorAmount;
        amounts[2] = nftContractCreatorAmount;
        amounts[3] = gitcoinDonorAmount;
        amounts[4] = ensHolderAmount;
        amounts[5] = nftHolderAmount;
        amounts[6] = memeHolderAmount;
        emit TokensClaimed(msg.sender, amounts);
    }

    function canClaim(
        ClaimOptions memory _options
    ) internal view returns (bool) {
        return
            canClaim(
                OptionType.Developer,
                _options.developerAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.OpenSourceContributor,
                _options.openSourceContributorAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.NftContractCreator,
                _options.nftContractCreatorAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.GitcoinDonor,
                _options.gitcoinDonorAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.EnsHolder,
                _options.ensHolderAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.NftHolder,
                _options.nftHolderAmount,
                _options.account
            ) &&
            canClaim(
                OptionType.MemeHolder,
                _options.memeHolderAmount,
                _options.account
            );
    }

    function updateClaimedAmounts(ClaimOptions memory _options) internal {
        updateClaimAmount(
            OptionType.Developer,
            _options.developerAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.OpenSourceContributor,
            _options.openSourceContributorAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.NftContractCreator,
            _options.nftContractCreatorAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.GitcoinDonor,
            _options.gitcoinDonorAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.EnsHolder,
            _options.ensHolderAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.NftHolder,
            _options.nftHolderAmount,
            _options.account
        );
        updateClaimAmount(
            OptionType.MemeHolder,
            _options.memeHolderAmount,
            _options.account
        );
    }

    function updateClaimAmount(
        OptionType optionType,
        uint256 amount,
        address account
    ) internal {
        if (amount > 0) {
            Option storage option = options[uint256(optionType)];
            option.claimedUsers++;
            option.claimedSupply += amount;
            hasClaimed[account][uint256(optionType)] = true;
        }
    }

    function canClaim(
        OptionType optionType,
        uint256 amount,
        address account
    ) internal view returns (bool) {
        if (amount == 0) {
            return true;
        }
        Option storage option = options[uint256(optionType)];
        return
            !hasClaimed[account][uint256(optionType)] &&
            amount <= option.maxClaimableAmount &&
            option.claimedSupply + amount <= option.totalSupply &&
            option.claimedUsers < option.maxClaimableUsers;
    }

    function _hash(
        ClaimOptions memory _options
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "ClaimOptions(address account,uint256 developerAmount,uint256 openSourceContributorAmount,uint256 nftContractCreatorAmount,uint256 gitcoinDonorAmount,uint256 ensHolderAmount,uint256 nftHolderAmount,uint256 memeHolderAmount)"
                        ),
                        _options.account,
                        _options.developerAmount,
                        _options.openSourceContributorAmount,
                        _options.nftContractCreatorAmount,
                        _options.gitcoinDonorAmount,
                        _options.ensHolderAmount,
                        _options.nftHolderAmount,
                        _options.memeHolderAmount
                    )
                )
            );
    }

    function _verify(
        ClaimOptions memory _options,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 digest = _hash(_options);
        return ECDSA.recover(digest, signature);
    }

    function setOption(
        OptionType optionType,
        uint256 totalSupply,
        uint256 claimedSupply,
        uint256 maxClaimableUsers,
        uint256 claimedUsers,
        uint256 maxClaimableAmount
    ) external onlyOwner {
        Option storage option = options[uint256(optionType)];
        option.totalSupply = totalSupply;
        option.claimedSupply = claimedSupply;
        option.maxClaimableUsers = maxClaimableUsers;
        option.claimedUsers = claimedUsers;
        option.maxClaimableAmount = maxClaimableAmount;
    }

    function emergencyOverrideClaim(
        address account,
        OptionType optionType,
        bool claimed
    ) external onlyOwner {
        hasClaimed[account][uint256(optionType)] = claimed;
    }

    function withdrawToken(uint256 amount) external onlyOwner {
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        token.transfer(msg.sender, amount);
    }

    function getAccount(
        address account,
        OptionType optionType
    ) public view returns (bool) {
        return hasClaimed[account][uint256(optionType)];
    }

    function getOption(
        OptionType optionType
    ) public view returns (Option memory) {
        return options[uint256(optionType)];
    }

    function isClaimed(address account) public view returns (bool) {
        for (uint256 i = 0; i <= uint256(OptionType.MemeHolder); i++) {
            if (hasClaimed[account][i]) {
                return true;
            }
        }
        return false;
    }
}
