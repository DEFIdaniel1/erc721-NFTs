const { run } = require('hardhat')

const verify = async (contractAddress, args) => {
    console.log('Verifying contract on-chain.....')
    try {
        await run('verify:verify', {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log('Verification complete!')
    } catch (e) {
        if (e.message.toLowerCase().includes('already verified')) {
            console.log('Already verified!')
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
