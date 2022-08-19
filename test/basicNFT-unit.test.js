const { assert } = require('chai')
const { getNamedAccounts, deployments, ethers } = require('hardhat')

describe('BasicNFT Unit Test', function () {
    let deploy, deployer, basicNFTContract
    beforeEach(async function () {
        deploy = deployments.deploy
        deployer = getNamedAccounts().deployer
        const BasicNFTContract = await ethers.getContractFactory('BasicNFT')
        basicNFTContract = await BasicNFTContract.deploy()
    })
    it('Contract deployed', async function () {
        console.log(basicNFTContract.address)
        assert(basicNFTContract.address)
    })
})
