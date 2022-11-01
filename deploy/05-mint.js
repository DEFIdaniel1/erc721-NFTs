const { ether, network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deployer } = getNamedAccounts();

  // //BasicNFT Mint
  // const basicNft = await ethers.getContract('BasicNFT', deployer)
  // const basicMintTx = await basicNft.mintNFT()
  // await basicMintTx.wait(1)
  // console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

  // //RandomNFT Mint
  // const randomNft = await ethers.getContract('RandomSword', deployer)
  // const mintFee = await randomNft.getMintFee()

  // await new Promise(async (resolve, reject) => {
  //     setTimeout(resolve, 30000) //5 minutes
  //     randomNft.once('NFTMinted', async function () {
  //         resolve()
  //     })
  //     const randomMintTx = await randomNft.requestNFT({ value: mintFee.toString() })
  //     const randomMintTxReceipt = await randomMintTx.wait(1)
  //     if (developmentChains.includes(network.name)) {
  //         const requestId = randomMintTxReceipt.events[1].args.requestId.toString()
  //         const vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock', deployer)
  //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNft.address)
  //     }
  // })
  // console.log(`RandomNFT index 0 tokenURI: ${await randomNft.getTokenURI(0)}`)
  // console.log(`RandomNFT index 1 tokenURI: ${await randomNft.getTokenURI(1)}`)
  // console.log(`RandomNFT index 2 tokenURI: ${await randomNft.getTokenURI(2)}`)

  // //DynamicNFT Mint
  const dynamicNft = await ethers.getContract("DynamicSvgNFT", deployer);

  const highValue = ethers.utils.parseEther("1000");
  const dynamicMintTx = await dynamicNft.mintNft(highValue.toString());
  await dynamicMintTx.wait(1);

  const lowerValue = ethers.utils.parseEther("6600");
  const dynamicMintLowTx = await dynamicNft.mintNft(lowerValue.toString());
  await dynamicMintLowTx.wait(1);
  console.log(`DynamicNFT ID0 tokenURI: ${await dynamicNft.tokenURI(0)}`);
  console.log("--------------");
  console.log(`DynamicNFT ID1 tokenURI: ${await dynamicNft.tokenURI(1)}`);

  //DynamicNFT2 Mint (patrick's function)
  // const highValue3 = ethers.utils.parseEther('4000')
  // const dynamicSvgNft = await ethers.getContract('DynamicNFT2', deployer)
  // const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue3)
  // await dynamicSvgNftMintTx.wait(1)
  // console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)

  // const lowValue3 = ethers.utils.parseEther('100')
  // const dynamicSvgNftMintTx2 = await dynamicSvgNft.mintNft(lowValue3)
  // await dynamicSvgNftMintTx2.wait(1)
  // console.log(`Dynamic SVG NFT index 1 tokenURI: ${await dynamicSvgNft.tokenURI(1)}`)
};
module.exports.tags = ["all", "mint"];
