// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract BasicNFT is ERC721 {
    //points to tokenJSON, which has image URI embedded
    string public constant TOKEN_URI =
        'ipfs://bafybeiglsajr4sd6q6myv2pv6kx45yev4j5zkcd2mmsilreieqkozdyl2e';
    uint256 private s_tokenCounter;

    //constructor(string memory name_, string memory symbol_) {
    constructor() ERC721('louieNFT', 'louie') {
        s_tokenCounter = 0;
    }

    //     function _safeMint(
    //          address to,
    //          uint256 tokenId,
    //          bytes memory data
    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter, '');
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public view override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
