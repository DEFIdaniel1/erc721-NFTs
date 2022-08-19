// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

error RandomizedNFT__RangeIsOutOfBounds();
error RandomizedNFT__NeedMoreETHToMint();
error RandomizedNFT__TokenTransferFailed();

contract RandomizedNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type declarations
    enum Breed {
        PUG, //0 super rare
        SHIBA_INU, //1 rare
        ST_BERNARD //2 common
    }

    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane; //keyHash
    uint32 private immutable i_callBackGasLimit;
    uint32 private constant NUM_WORDS = 1;
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
    event NFTMinted(Breed nftBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callBackGasLimit,
        string[3] memory tokenURIs,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721('Random Doggo', 'RANDY') {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callBackGasLimit = callBackGasLimit;
        s_tokenURIs = tokenURIs;
        i_mintFee = mintFee;
    }

    // Function 1, requests random number, sets this msg.sender as nftOwner
    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomizedNFT__NeedMoreETHToMint();
        }
        // get random number
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callBackGasLimit,
            NUM_WORDS
        );
        //need to map the request to sender b/c chainlink will be the one sending the second part of transaction
        //- don't want the NFT to go to msg.sender or it would go to chainlink
        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    //Function 2 fulfills the nft mint when receiving the randomNumber
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        //map user from requestNFT function as owner
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        // randomWords will return MASSIVE NUMBER, divide by 100 means, get 0-99

        Breed nftBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(nftOwner, newTokenId);
        // passing in the nftBreed is actually a NUMBER 0, 1, 2;
        // so will output the corresponding tokenURI when in the same order
        _setTokenURI(newTokenId, s_tokenURIs[uint256(nftBreed)]);
        emit NFTMinted(nftBreed, nftOwner);
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        //loop through the 3 values in the chanceArray to see which breed matches
        for (uint256 i = 0; i < chanceArray.length; i++) {
            // loop checks if value between 0/10, then 10/30, then 30/100
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                // if returns Breed(0) => PUG super rare
                // if returns Breed(1) => SHIBA_INU rare
                // if returns Breed(2) => ST_BERNARD common
                return Breed(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert RandomizedNFT__RangeIsOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        // 10% chance for 1st array item; 20% for second array item; 70%
        //      0-10 = PUG
        //      10-20 = SHIBA_INU
        //      30-100 = ST_BERNARD
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdrawNFT() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}('');
        if (!success) {
            revert RandomizedNFT__TokenTransferFailed();
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
}
