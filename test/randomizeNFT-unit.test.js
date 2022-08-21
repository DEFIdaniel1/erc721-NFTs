const { assert } = require('chai')
const { deployments, ethers, network, log } = require('hardhat')
const { networkConfig, randomNFTTokenURIs } = require('../helper-hardhat-config')

describe.only('Randomize NFT Unit Test', function () {
    const chainId = network.config.chainId
    let deployer, randomizedNFTContract, account1, vrfCoordinatorV2Mock
    beforeEach(async function () {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        account1 = accounts[1]
        await deployments.fixture(['mocks', 'random'])
        randomizedNFTContract = await ethers.getContract('RandomizedNFT')
        vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
    })
    describe('Constructor', async function () {
        it('Deploys contract to an address', async function () {
            assert(randomizedNFTContract.address)
        })
        it('Deploys correct mintFee', async function () {
            let expectedValue = networkConfig[chainId].mintFee
            const mintFee = await randomizedNFTContract.getMintFee()
            assert.equal(expectedValue, mintFee.toString())
        })
        it('Deploys correct callbackGasLimit', async function () {
            let expectedValue = networkConfig[chainId].callbackGasLimit
            const callbackGasLimit = await randomizedNFTContract.getCallbackGasLimit()
            assert.equal(expectedValue, callbackGasLimit.toString())
        })
        it('Deploys correct gasLane', async function () {
            let expectedValue = networkConfig[chainId].gasLane
            const gasLane = await randomizedNFTContract.getGasLane()
            assert.equal(expectedValue, gasLane.toString())
        })
        it('Deploys with correct NFT URIs', async function () {
            let expectedValue = randomNFTTokenURIs
            let uriValue
            for (let i = 0; i < expectedValue.length; i++) {
                uriValue = await randomizedNFTContract.getTokenURI(i)
                exectedURI = expectedValue[i]
                assert.equal(exectedURI, uriValue)
            }
        })
    })
})
