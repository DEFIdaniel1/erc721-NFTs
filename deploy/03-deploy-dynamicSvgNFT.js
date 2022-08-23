const { network, ethers } = require('hardhat')
const { networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const fs = require('fs')

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let ethUsdPriceFeedAddress
    const chainId = network.config.chainId
    const lowSvg = fs.readFileSync('./NFT-images/dynamic/frown.svg', { encoding: 'utf8' })
    const highSvg = fs.readFileSync('./NFT-images/dynamic/happy.svg', { encoding: 'utf8' })

    if (chainId == 31337) {
        // Get local ETH/USD price feed
        const EthUsdAggregator = await ethers.getContract('MockV3Aggregator')
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log('-------------Deploying DYNAMIC NFT-----------------')
    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
    const nftContract = await deploy('DynamicSvgNFT', {
        contract: 'DynamicSvgNFT',
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
    })
    log('Deployment successful!')
    log(`-------------------------------------------------`)

    if (chainId != 31337) {
        await verify(nftContract.address, args)
    }
}
module.exports.tags = ['all', 'dynamic']
