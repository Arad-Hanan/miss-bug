import crypto from 'crypto'

import { userService } from './user.service.js'

const cookieName = 'loginToken'
const tokenLifetimeSeconds = 60 * 60 * 24 * 7

export const authService = {
    signup: userService.signup,
    login,
    logout,
    getLoggedinUser,
    setLoginToken
}

function login(credentials) {
    return userService.authenticate(credentials.username, credentials.password)
        .then(user => ({ user, token: _createToken(user._id) }))
}

function logout(res) {
    res.clearCookie(cookieName, _cookieOptions())
}

function setLoginToken(res, token) {
    res.cookie(cookieName, token, { ..._cookieOptions(), maxAge: tokenLifetimeSeconds * 1000 })
}

function getLoggedinUser(req) {
    const token = req.cookies[cookieName]
    if (!token) return Promise.reject(new Error('Authentication required'))

    return Promise.resolve().then(() => {
        const [payload, signature] = token.split('.')
        if (!payload || !signature || !_isValidSignature(payload, signature)) {
            throw new Error('Invalid login token')
        }
        const tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString())
        if (tokenData.exp < Date.now()) throw new Error('Login token expired')
        return userService.getById(tokenData.userId).then(userService.toMiniUser)
    })
}

function _createToken(userId) {
    const payload = Buffer.from(JSON.stringify({
        userId,
        exp: Date.now() + tokenLifetimeSeconds * 1000
    })).toString('base64url')
    const signature = crypto.createHmac('sha256', _secret()).update(payload).digest('base64url')
    return `${payload}.${signature}`
}

function _isValidSignature(payload, signature) {
    const expected = Buffer.from(crypto.createHmac('sha256', _secret()).update(payload).digest('base64url'))
    const actual = Buffer.from(signature)
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function _secret() {
    if (process.env.NODE_ENV === 'production' && !process.env.SECRET1) {
        throw new Error('SECRET1 must be configured in production')
    }
    return process.env.SECRET1 || 'missbug-local-only-change-before-deployment'
}

function _cookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    }
}