const { assert, expect } = require('chai')
const { deployments, ethers, network } = require('hardhat')
const { networkConfig, randomNFTTokenURIs, developmentChains } = require('../helper-hardhat-config')

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('Randomize NFT Unit Test', function () {
          const chainId = network.config.chainId
          let deployer, randomSwordContract, account1, vrfCoordinatorV2Mock
          const mintFee = networkConfig[chainId].mintFee
          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              account1 = accounts[1]
              await deployments.fixture(['mocks', 'random'])
              randomSwordContract = await ethers.getContract('RandomSword')
              vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
          })
          describe('Constructor', async function () {
              it('Deploys contract to an address', async function () {
                  assert(randomSwordContract.address)
              })
              it('Deploys correct mintFee', async function () {
                  const contractMintFee = await randomSwordContract.getMintFee()
                  assert.equal(mintFee, contractMintFee.toString())
              })
              it('Deploys correct callbackGasLimit', async function () {
                  let expectedValue = networkConfig[chainId].callbackGasLimit
                  const callbackGasLimit = await randomSwordContract.getCallbackGasLimit()
                  assert.equal(expectedValue, callbackGasLimit.toString())
              })
              it('Deploys correct gasLane', async function () {
                  let expectedValue = networkConfig[chainId].gasLane
                  const gasLane = await randomSwordContract.getGasLane()
                  assert.equal(expectedValue, gasLane.toString())
              })
              it('Deploys with correct NFT URIs', async function () {
                  let expectedValue = randomNFTTokenURIs
                  let uriValue
                  for (let i = 0; i < expectedValue.length; i++) {
                      uriValue = await randomSwordContract.getTokenURI(i)
                      exectedURI = expectedValue[i]
                      assert.equal(exectedURI, uriValue)
                  }
              })
          })
          describe('requestNFT function', async function () {
              it('Reverts if payment is not enough', async function () {
                  const lessMintFee = mintFee.value - 1
                  await expect(
                      randomSwordContract.requestNFT({ value: lessMintFee })
                  ).to.be.revertedWithCustomError(
                      randomSwordContract,
                      'RandomSword__NeedMoreETHToMint'
                  )
              })
              it('Emits event NFTRequested', async function () {
                  await expect(randomSwordContract.requestNFT({ value: mintFee })).to.emit(
                      randomSwordContract,
                      'NFTRequested'
                  )
              })
              it('Maps requestIdToSender', async function () {
                  await randomSwordContract.requestNFT({ value: mintFee })
                  await randomSwordContract.connect(account1).requestNFT({ value: mintFee })
                  // Mapping requestIDs start at 1, not 0
                  const nftAccountMapToDeployer = await randomSwordContract.s_requestIdToSender(1)
                  assert.equal(nftAccountMapToDeployer, deployer.address)
                  const nftAccountMapToAccount1 = await randomSwordContract.s_requestIdToSender(2)
                  assert.equal(nftAccountMapToAccount1, account1.address)
              })
          })
          //** need to make sure deploy script funds chainlink oracle for localhost
          //   describe('fulfillRandomWords', async function () {
          //       it('Mints a new NFT after random number is returned', async function () {
          //           await new Promise(async (resolve, reject) => {
          //               // waits for NFTMinded event to be emitted
          //               randomSwordContract.once('NFTMinted', async function () {
          //                 //***** */ is not firing NFTMinted from the VRF contract for some reason...
          //                   try {
          //                       console.log('inside the .once function...')
          //                       const tokenURI = await randomSwordContract.getTokenURI(0)
          //                       const tokenCounter = await randomSwordContract.getTokenCounter()
          //                       assert.equal(tokenURI.toString().includes('ipfs://'), true)
          //                       assert.equal(tokenCounter.toString(), '1')
          //                       resolve()
          //                   } catch (e) {
          //                       console.log(e)
          //                       reject(e)
          //                   }
          //               })
          //               try {
          //                   const tx = await randomSwordContract.requestNFT({ value: mintFee })
          //                   txReceipt = await tx.wait(1)
          //                   console.log(txReceipt.events[1].args.requestId.toString())
          //                   console.log(randomSwordContract.address)
          //                   await vrfCoordinatorV2Mock.fulfillRandomWords(
          //                       txReceipt.events[1].args.requestId,
          //                       vrfCoordinatorV2Mock.address
          //                   )
          //                   console.log('fulfillRandomWords was called...')
          //               } catch (e) {
          //                   console.log(e)
          //                   reject(e)
          //               }
          //           })
          //       })
          //   })
      })
