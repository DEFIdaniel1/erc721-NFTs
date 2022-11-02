// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import 'base64-sol/base64.sol';

error DynamicSvgNFT__TokenIdDoesNotExist();

/**
 *  @dev Contract mints a dynamic NFT, that changes based on an ETH price
 *       URI data and SVG files are stored on-chain for immutability
 *       When minting, user can select a highEth price target.
 *       outputs different image based on if it's above or below target.
 *       leverages chainlink oracles
 */
contract DynamicSvgNFT is ERC721 {
    uint256 private s_tokenIdCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    AggregatorV3Interface private immutable i_priceFeed;
    string private constant base64EncodedSvgPrefix =
        'data:image/svg+xml;base64,';

    /**
     * @dev maps tokenID => highValue
     */
    mapping(uint256 => int256) public s_tokenIdToHighValues;

    event NFTMinted(uint256 indexed tokenId, int256 indexed highValue);

    /**
     * @param priceFeedAddress will be chain-specific chainlink address
     * @param lowSvg/highSvg are utf8 encoded SVG files
     */
    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721('Happy Sad Eth Price', 'HAPPY') {
        s_tokenIdCounter = 0;
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @dev Converts SVGs to base64 + prepends SVG prefix so it can be rendered
     */
    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    /**
     * @dev Mints NFT, assigns highValue for changing quality, sends to msg.sender
     * @param highValue is price in ETH for change turning point
     * emits event mapping token to highValue
     */
    function mintNft(int256 highValue) public {
        s_tokenIdToHighValues[s_tokenIdCounter] = highValue;
        _safeMint(msg.sender, s_tokenIdCounter);
        s_tokenIdCounter++;
        emit NFTMinted(s_tokenIdCounter, highValue);
    }

    /**
     * @dev prepends URI data so it so base64 JSON is readable
     */
    function _baseURI() internal pure override returns (string memory) {
        return 'data:application/json;base64,';
    }

    /**
     * @dev Function will read chainlink ETH pricefeed and output a
     *      dynamic image based on the price vs highValue set by minter.
     *      returns _baseURI concactenated to the data JSON base64
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert DynamicSvgNFT__TokenIdDoesNotExist();
        }
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdToHighValues[tokenId]) {
            imageURI = s_highImageURI;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"Watch my Bags!", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenIdCounter;
    }
}
