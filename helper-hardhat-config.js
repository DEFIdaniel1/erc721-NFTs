const networkConfig = {
    31337: {
        name: 'localhost',
        ethUsdPriceFeed: '0x9326BFA02ADD2366b30bacB125260Af641031331',
        gasLane:
            '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc', // 30 gwei
        callbackGasLimit: '500000', // 500,000 gas
        mintFee: '10000000000000000', // 0.01 ETH
        blockConfirmations: 1,
        subscriptionId: 'vrfCoordinatorV2Mock',
    },
    4: {
        name: 'rinkeby',
        ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
        vrfCoordinatorV2: '0x6168499c0cFfCaCD319c818142124B7A15E857ab',
        gasLane:
            '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
        callbackGasLimit: '500000', // 500,000 gas
        mintFee: '20000000000000000', // 0.02 ETH
        subscriptionId: '9945',
        blockConfirmations: 6,
    },
    5: {
        name: 'goerli',
        ethUsdPriceFeed: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        vrfCoordinatorV2: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
        gasLane:
            '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15', //30 gwei
        callbackGasLimit: '500000', // 500,000 gas
        subscriptionId: '337',
        mintFee: '20000000000000000', // 0.02 ETH
        blockConfirmations: 6,
    },
    80001: {
        name: 'polygon mumbai',
        ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        blockConfirmations: 6,
    },
}

const developmentChains = ['hardhat', 'localhost']
const DECIMALS = '18'
const INITIAL_PRICE = '200000000000000000000'
const VRF_SUB_FUND_AMOUNT = '10000000000000000000' //10 LINK
const randomSwordURIs = [
    'ipfs://QmaHJeNRETkCgpvUrd5xxmAhea6eoUpsdtXqy3Cwym2GAM',
    'ipfs://QmcztQp4He8sf3hfSe4A3mQGEvpjfPD6x3cweYpmqw5K9K',
    'ipfs://QmPeQgDwgzRsQJyVfq8vgqmN4zxGwoVxRzi34z8YC4cdgf',
]

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
    randomSwordURIs,
    VRF_SUB_FUND_AMOUNT,
}
