const { network, ethers } = require('hardhat')
const { verify } = require('../utils/verify')

module.exports = async function main({ getNamedAccounts, deployments }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = []

    // Deploy Basic NFT contract
    const nftContract = await deploy('BasicNFT', {
        contract: 'BasicNFT',
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify contract if not on testnet
    if (chainId != 31337) {
        await verify(nftContract.address, args)
    }
}

module.exports.tags = ['all', 'basic', 'contracts']
