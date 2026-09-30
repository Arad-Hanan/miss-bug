import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const seedDir = path.join(projectRoot, 'seed')

export const utilService = {
    readJsonFile,
    writeJsonFile,
    makeId,
    getDataFilePath
}

function getDataFilePath(fileName) {
    const dataDir = path.resolve(process.env.DATA_DIR || path.join(projectRoot, 'data'))
    return path.join(dataDir, fileName)
}

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        const seedPath = path.join(seedDir, path.basename(filePath))
        if (fs.existsSync(seedPath)) fs.copyFileSync(seedPath, filePath)
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJsonFile(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
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
