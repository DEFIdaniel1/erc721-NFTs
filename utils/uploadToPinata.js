const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')

const pinataAPIKey = process.env.PINATA_API_KEY
const pinataAPISecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataAPIKey, pinataAPISecret)

// Stores images to IPFS via pinata
// Need to send readable file stream
// Response object contains IPFS hash
async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const imageFiles = fs.readdirSync(fullImagesPath)
    console.log('Uploading images to IPFS...')
    let responses = []
    for (i in imageFiles) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${imageFiles[i]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }
    return { responses, imageFiles }
}

// Store JSON metadata (with images) to IPFS via pinata
async function storeTokenURIMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
}

module.exports = { storeImages, storeTokenURIMetadata }
