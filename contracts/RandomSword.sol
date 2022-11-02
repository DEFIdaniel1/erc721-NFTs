// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

error RandomSword__RangeIsOutOfBounds();
error RandomSword__NeedMoreETHToMint();
error RandomSword__TokenTransferFailed();

/**
 * @title Random Sword NFT contract
 * @dev Contract outputs a verifiably random NFT using chainlink's random # output
 *      Rarity levels for NFTs are stored on-chain
 */
contract RandomSword is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    enum Swords {
        DIAMOND_SWORD, //5% chance: super rare
        STEEL_SWORD, //20% chance: rare
        IRON_SWORD //75% chance: common
    }

    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane; //keyHash
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1; //random numbers
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 private s_tokenCounter;
    uint256 private constant MAX_CHANCE_VALUE = 100;
    string[] internal s_tokenURIs;
    uint256 internal immutable i_mintFee;

    // EVENTS
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Swords nftSwords, address minter);

    /**
     * @dev Using VRFCoordinator to get random number. Docs include gaslane recommendations
     *      Most constructor elements are required for i_vrfCoordinator.requestRandomWords
     * @param tokenURIs are 3x URIs for each sword's metadata
     */
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory tokenURIs,
        uint256 mintFee
    )
        VRFConsumerBaseV2(vrfCoordinatorV2)
        ERC721('Epic Random Swords', 'SWORD')
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenURIs = tokenURIs;
        i_mintFee = mintFee;
    }

    /**
     * @dev User requests NFT (pays mint fee), which requests randomWord from chainlink VRF
     *      Retruns the requestId, which starts at 0, and increments per request
     *      Mapping is required b/c chainlink sends second part of the transaction
     *      Do not want the NFT going to msg.sender since chainlink is 'minting'
     */
    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomSword__NeedMoreETHToMint();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    /**
     * @dev Fuflills NFT mint when randomWord is received
     *      Is called by chainlink when random # is generated
     *      Mints the token and maps it to the nftOwner
     *      Sets tokenURI to match the minted tokenId
     *      Emits event indexing sword to owner
     * @param randomWords is an array. [0] will be our first and only number
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRandomNumber = randomWords[0] % MAX_CHANCE_VALUE;
        Swords nftSword = getRandomSwordFromNumber(moddedRandomNumber);
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_tokenURIs[uint256(nftSword)]);
        s_tokenCounter++;
        emit NFTMinted(nftSword, nftOwner);
    }

    /**
     * @dev Uses random word generated to output the random
     *      Uses moddedRandomNumber to loop through chance array for the right output
     *      Checks if value between 0/5, then 10/25, then 25/100
     *      Returns 0, 1, or 2 - corresponding to Sword enum
     */
    function getRandomSwordFromNumber(uint256 moddedRandomNumber)
        public
        pure
        returns (Swords)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRandomNumber >= cumulativeSum &&
                moddedRandomNumber < chanceArray[i]
            ) {
                return Swords(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert RandomSword__RangeIsOutOfBounds();
    }

    /**
     * @dev Returns chance array
     *      0-5: super rare, 5-25: rare, 25-100: common
     */
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [5, 30, MAX_CHANCE_VALUE];
    }

    /**
     * @dev Allows original minter to withdraw their NFT balance on the contract
     *      Transfers token to NFT owner only
     */
    function withdrawNFT() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}('');
        if (!success) {
            revert RandomSword__TokenTransferFailed();
        }
    }

    // PURE VIEW FUNCTIONS
    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getTokenURI(uint256 index) public view returns (string memory) {
        return s_tokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getCallbackGasLimit() public view returns (uint256) {
        return i_callbackGasLimit;
    }

    function getGasLane() public view returns (bytes32) {
        return i_gasLane;
    }

    function getSubscriptionId() public view returns (uint256) {
        return i_subscriptionId;
    }
}
