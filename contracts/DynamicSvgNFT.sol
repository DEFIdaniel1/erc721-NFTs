// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import 'base64-sol/base64.sol';

error DynamicSvgNFT__TokenIdDoesNotExist();

contract DynamicSvgNFT is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    AggregatorV3Interface internal immutable i_priceFeed;
    string private constant base64EncodedSvgPrefix = 'data:image/svg+xml;base64,';

    mapping(uint256 => uint256) public s_tokenIdToHighValue;

    event NFTMinted(uint256 indexed tokenId, uint256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721('Dynamic SVG NFT', 'DYNFT') {
        s_tokenCounter = 0;
        // don't want to store images as SVG files, want them as bytes
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(uint256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter++; //best practice to increase token counter BEFORE minting
        _safeMint(msg.sender, s_tokenCounter);
        emit NFTMinted(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return 'data:application/json;base64';
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert DynamicSvgNFT__TokenIdDoesNotExist();
        }
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        //typcast price int to uint
        if (uint256(price) >= s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highImageURI;
        }
        return
            string(
                abi.encodePacked(
                    'data:application/json;base64', //need to concatenate to the beginning
                    Base64.encode(
                        bytes( //needs to be in bytes to be encoded in Base64
                            abi.encodePacked( //JSON data
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
