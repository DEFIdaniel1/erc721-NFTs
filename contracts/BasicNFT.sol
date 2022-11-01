// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 *   @dev NFT Minting function that points to static IPFS metadata - immutable link stored on-Chain
 *        mintNFT() - mints a single NFT to minting address
 *        safeTransferFrom(from, to, tokenID)
 *        setApprovalForAll(address: operator, bool: approved)
 */
contract BasicNFT is ERC721 {
  string public constant TOKEN_URI =
    "ipfs://bafybeiglsajr4sd6q6myv2pv6kx45yev4j5zkcd2mmsilreieqkozdyl2e";
  uint256 private s_tokenCounter;

  /**
   *    @dev constructor(string memory name_, string memory symbol_)
   */
  constructor() ERC721("Ultra Rare Item", "URI") {
    s_tokenCounter = 0;
  }

  /**
   *   @dev Function mints the NFT and increments token count
   *        _safeMint(address to, uint256 tokenId,  bytes memory data)
   */
  function mintNFT() public returns (uint256) {
    _safeMint(msg.sender, s_tokenCounter, "");
    s_tokenCounter++;
    return s_tokenCounter;
  }

  // PURE Functions  ///

  /**
   *   @dev uint256 input is tokenId
   *        Original contract checks if minted, outputs relevant URI
   */
  function tokenURI(uint256) public pure override returns (string memory) {
    return TOKEN_URI;
  }

  /**
   *    @dev returns current token count for total quantity
   */
  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
