const { assert } = require('chai')
const { getNamedAccounts, deployments, ethers } = require('hardhat')

describe('BasicNFT Unit Test', function () {
    let deploy, deployer, basicNFTContract
    beforeEach(async function () {
        deploy = deployments.deploy
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        const BasicNFTContract = await ethers.getContractFactory('BasicNFT')
        basicNFTContract = await BasicNFTContract.deploy()
    })
    describe('Contract deploys correctly', async function () {
        it('Contract deploys', async function () {
            assert(basicNFTContract.address)
        })
        it('Constructor starts tokenCounter at 0', async function () {
            const expectedValue = 0
            const tokenCounter = await basicNFTContract.getTokenCounter()
            assert.equal(tokenCounter.toString(), expectedValue)
        })
        it('NFT name and symbol are correct', async function () {
            const expectedName = 'louieNFT'
            const actualName = await basicNFTContract.name()
            assert.equal(expectedName, actualName)

            const expectedSymbol = 'LOUIE'
            const actualSymbol = await basicNFTContract.symbol()
            assert.equal(expectedSymbol, actualSymbol)
        })
        it('TokenURI outputs correctly', async function () {
            const expectedValue =
                'ipfs://bafybeiglsajr4sd6q6myv2pv6kx45yev4j5zkcd2mmsilreieqkozdyl2e'
            const tokenURI = await basicNFTContract.tokenURI(0)
            assert.equal(expectedValue, tokenURI.toString())
        })
    })
    describe('Mint Function', async function () {
        it('Token counter increases +1 with mint', async function () {
            const expectedValue = 1
            const mintTx = await basicNFTContract.mintNFT()
            await mintTx.wait(1)
            const tokenCounter = await basicNFTContract.getTokenCounter()
            assert.equal(expectedValue, tokenCounter.toString())
        })
        it('Account that mints receives the NFT', async function () {
            const initialBalance = 1
            const mintTx = await basicNFTContract.mintNFT()
            await mintTx.wait(1)
            const deployerWallet = await basicNFTContract.balanceOf(deployer.address)
            assert.equal(initialBalance, deployerWallet)
        })
    })
})
