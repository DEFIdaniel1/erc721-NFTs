const { network, ethers } = require('hardhat')
const {
    developmentChains,
    networkConfig,
    randomNFTTokenURIs,
    VRF_SUB_FUND_AMOUNT,
} = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const { storeImages, storeTokenURIMetadata } = require('../utils/uploadToPinata')

const imagesLocation = './NFT-images/random'
const pinataUploadStatus = process.env.UPLOAD_TO_PINATA
const chainId = network.config.chainId
const metadataTemplate = {
    name: '',
    description: '',
    image: '',
    attributes: [{ trait_types: '', value: 100 }],
}
const tokenURIs = randomNFTTokenURIs
const vrfSubFundAmount = VRF_SUB_FUND_AMOUNT
let vrfCoordinatorV2Mock

module.exports = async function main({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    let vrfCoordinatorV2Address, subscriptionId
    // For the URIs, we need to upload the images, get IPFS hashes
    // 3 methods: yourself, a centralied service like pinata, nft.storage(uses filecoin)
    // only doing pinata here
    if (pinataUploadStatus == 'true') {
        tokenURIs = await handleTokenUris()
    } else {
        log(`IPFS status = ${pinataUploadStatus}. No IPFS upload.`)
    }

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenURIs,
        networkConfig[chainId].mintFee,
    ]

    const randomizedNftContract = await deploy('RandomizedNFT', {
        contract: 'RandomizedNFT',
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig.blockConfirmations || 1,
    })
    log('----------randomizedNFT contract deployed-------------------')

    if (chainId == 31337) {
        //need to add consumer AFTER deploying contract
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomizedNftContract.address)
        log('VRF mock consumer added!')
        //need to fund it with LINK or tests will fail
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, vrfSubFundAmount)
        log('VRF mock contract funded.')
    }
    if (chainId != 31337) {
        await verify(randomizedNftContract.address, args)
    }
}

async function handleTokenUris() {
    console.log('------------IPFS Upload----------------------')
    tokenURIs = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    // imageuploadresponses is an object with IpfsHash as one of the items
    // files are the file names 'image.png'
    for (i in imageUploadResponses) {
        let tokenURIMetadata = metadataTemplate
        tokenURIMetadata.name = files[i].replace('.jpg', '').replace('-', ' ') //remove .jpg and - from file names
        tokenURIMetadata.description = `One of a kind, original art work by Louie Pisterzi.`
        tokenURIMetadata.image = `ipfs://${imageUploadResponses[i].IpfsHash}` //image hashes
        console.log(`Uploading JSON file ${tokenURIMetadata.name}...`)
        const uploadResponse = await storeTokenURIMetadata(tokenURIMetadata) //upload to IPFS
        tokenURIs.push(uploadResponse.IpfsHash) //hash from the JSON metadata files
    }
    console.log(tokenURIs)
    console.log('------------------------------------------------')
    return tokenURIs
}

module.exports.tags = ['all', 'random']
