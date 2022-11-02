const { network, ethers } = require('hardhat')
const {
    developmentChains,
    networkConfig,
    randomSwordURIs,
    VRF_SUB_FUND_AMOUNT,
} = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const {
    storeImages,
    storeTokenURIMetadata,
} = require('../utils/uploadToPinata')

const imagesLocation = './NFT-images/swords'
const pinataUploadStatus = process.env.UPLOAD_TO_PINATA
const chainId = network.config.chainId
const metadataTemplate = {
    name: '',
    description: '',
    image: '',
    attributes: [],
}
let tokenURIs = randomSwordURIs
const vrfSubFundAmount = VRF_SUB_FUND_AMOUNT
let vrfCoordinatorV2Mock

module.exports = async function main({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    let vrfCoordinatorV2Address, subscriptionId

    // For the URIs, we need to upload the images, and get the IPFS hashes first
    // If upload needed, set env pinataUploadStatus to true
    if (pinataUploadStatus == 'true') {
        tokenURIs = await handleTokenUris()
    } else {
        log(`IPFS status = ${pinataUploadStatus}. No IPFS upload.`)
    }

    // If development chain is set to hardhat or localhost, run mocks
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    } else {
        // Else use the vrfCoordinator address/ subscription for the relevant chain
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    // Contract constructor args
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenURIs,
        networkConfig[chainId].mintFee,
    ]

    // Deploy contract
    const randomSwordContract = await deploy('RandomSword', {
        contract: 'RandomSword',
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig.blockConfirmations || 1,
    })
    log('----------randomSword contract deployed-------------------')

    // Connects VRF coordinator mock with new contract. Funds with LINK or tests will fail
    // Consumer (contract address) required to be added to Chainlink oracle vrfContract
    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            randomSwordContract.address
        )
        log('VRF mock consumer added!')
        await vrfCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            vrfSubFundAmount
        )
        log('VRF mock contract funded.')
    }
    if (chainId != 31337) {
        await verify(randomSwordContract.address, args)
    }
}

/**
 * Function uploads images and metadata to IPFS
 * storeImages function stores the images on Pinata and get the IPFS address - input(image path)
 *  > returns responses(IPFS hashes to array), files(image files)
 * Function builds out metadata files using template, adds newly stored images
 * Metatada is then stored to IPFS via pinata
 */
async function handleTokenUris() {
    console.log('------------IPFS Upload----------------------')
    tokenURIs = []

    // Save images to IPFS
    const { responses: imageUploadResponses, imageFiles: files } =
        await storeImages(imagesLocation)
    for (i in imageUploadResponses) {
        let tokenURIMetadata = metadataTemplate
        // Building URI metadata
        // Get the item name from the file by removing .jpeg/png/-
        tokenURIMetadata.name = files[i]
            .replace('.jpeg', '')
            .replace('.png', '')
            .replace('-', ' ')
        tokenURIMetadata.description = `Incredible random sword generation. Will you get the iron, steel or diamond sword? Looks like you received the ${tokenURIMetadata.name}!`
        tokenURIMetadata.attributes = [{ Stength: '5', Damage: '50' }]
        tokenURIMetadata.image = `ipfs://${imageUploadResponses[i].IpfsHash}` //get the image hashes
        console.log(`Uploading JSON file ${tokenURIMetadata.name}...`)

        // Upload token metadata
        const uploadResponse = await storeTokenURIMetadata(tokenURIMetadata)
        tokenURIs.push(uploadResponse.IpfsHash) //get the JSON data hash
    }
    console.log(tokenURIs)
    console.log('------------------------------------------------')
    return tokenURIs
}

module.exports.tags = ['all', 'random', 'contracts']
