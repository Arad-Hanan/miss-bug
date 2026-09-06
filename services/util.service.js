import fs from 'fs'

export const utilService = {
    readJsonFile,
    writeJsonFile,
    makeId
}

function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJsonFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
            if (err) return reject(err)
            resolve()
        })
    })
}

function makeId(length = 5) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < length; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return id
}