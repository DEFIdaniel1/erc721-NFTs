const { verifyMessage } = require('ethers/lib/utils')
const { network, ethers } = require('hardhat')
const { verify } = require('../utils/verify')

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const nftContract = await deploy('BasicNFT', {
        contract: 'BasicNFT',
        from: deployer,
        log: true,
        args: [],
    })

    if (chainId != 31337) {
        await verify(nftContract.address, [])
    }

    // const basicNFTContract = await ethers.getContract('BasicNFT')
}
