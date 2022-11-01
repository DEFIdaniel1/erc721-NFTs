# NFT Token Contracts (ERC721 - 3 Types)

This project has 3 types of NFTs for deployment.

## Basic NFT

<li>This is a basic NFT contract</li>
<li>The URI is stored on the blockchain, so is immutable</li>

## Dynamic SVG NFT

<li>Contract that mints an NFT that changes based on the price of ETH</li>
<li>Price feed is monitored via Chainlink vrfCoordinator</li>
<li>All metadata and images (SVG) are stored on-chain and immutable</li>

## Random Sword NFT

<li>Contract that mints one of 3 Sword NFTs based on its rarity</li>
<li>Random number is generated via Chainlink, which then outputs the corresponding sword</li>
<li>Could be applied to any types of items/objects for games or the metaverse</li>
