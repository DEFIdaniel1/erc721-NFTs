const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')

const pinataAPIKey = process.env.PINATA_API_KEY
const pinataAPISecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataAPIKey, pinataAPISecret)

async function storeImages(imagesFilePath) {
    //outputs full image path
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log('Uploading images to IPFS...')
    let responses = []
    for (i in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[i]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }
    return { responses, files }
}

async function storeTokenURIMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
}

module.exports = { storeImages, storeTokenURIMetadata }
