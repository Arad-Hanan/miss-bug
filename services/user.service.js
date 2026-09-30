import crypto from 'crypto'

import { utilService } from './util.service.js'

const usersPath = utilService.getDataFilePath('users.json')
const users = utilService.readJsonFile(usersPath)
const ready = Promise.resolve().then(() => {
    const admin = users.find(user => user.username === 'admin')
    if (admin && !(process.env.NODE_ENV === 'production' && admin.salt === 'missbug-admin-salt')) return
    const adminPassword = process.env.NODE_ENV === 'production' ? process.env.ADMIN_PASSWORD : 'admin'
    if (!adminPassword) throw new Error('ADMIN_PASSWORD must be configured in production')
    const salt = crypto.randomBytes(16).toString('hex')
    return _hashPassword(adminPassword, salt).then(passwordHash => {
        if (admin) {
            admin.salt = salt
            admin.passwordHash = passwordHash
            return _saveUsers()
        }
        users.push({
            _id: utilService.makeId(),
            username: 'admin',
            fullname: 'MissBug Admin',
            salt,
            passwordHash,
            isAdmin: true
        })
        return _saveUsers()
    })
})

export const userService = {
    query,
    getById,
    getByUsername,
    signup,
    authenticate,
    remove,
    toMiniUser
}

function query() {
    return ready.then(() => users.map(toMiniUser))
}

function getById(userId) {
    return ready.then(() => {
        const user = users.find(currUser => currUser._id === userId)
        if (!user) throw new Error('User not found')
        return user
    })
}

function getByUsername(username) {
    return ready.then(() => users.find(user => user.username === username))
}

function signup(userInfo) {
    return ready.then(() => {
        const username = (userInfo.username || '').trim()
        const fullname = (userInfo.fullname || '').trim()
        const password = userInfo.password || ''
        if (!username || !fullname || password.length < 4) {
            throw new Error('Username and full name are required; password must be at least 4 characters')
        }
        if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Username is already taken')
        }

        const salt = crypto.randomBytes(16).toString('hex')
        return _hashPassword(password, salt).then(passwordHash => {
            const user = {
                _id: utilService.makeId(),
                username,
                fullname,
                salt,
                passwordHash,
                isAdmin: false
            }
            users.push(user)
            return _saveUsers().then(() => toMiniUser(user))
        })
    })
}

function authenticate(username, password) {
    return getByUsername((username || '').trim()).then(user => {
        if (!user) throw new Error('Invalid username or password')
        return _hashPassword(password || '', user.salt).then(passwordHash => {
            const actualHash = Buffer.from(passwordHash, 'hex')
            const expectedHash = Buffer.from(user.passwordHash, 'hex')
            if (actualHash.length !== expectedHash.length || !crypto.timingSafeEqual(actualHash, expectedHash)) {
                throw new Error('Invalid username or password')
            }
            return toMiniUser(user)
        })
    })
}

function remove(userId) {
    return ready.then(() => {
        const userIdx = users.findIndex(user => user._id === userId)
        if (userIdx < 0) throw new Error('User not found')
        if (users[userIdx].username === 'admin') throw new Error('The admin user cannot be deleted')
        users.splice(userIdx, 1)
        return _saveUsers()
    })
}

function toMiniUser(user) {
    return {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        isAdmin: !!user.isAdmin
    }
}

function _hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) return reject(err)
            resolve(derivedKey.toString('hex'))
        })
    })
}

function _saveUsers() {
    return utilService.writeJsonFile(usersPath, users)
}