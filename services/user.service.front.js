const STORAGE_KEY = 'loggedinUser'

export const userService = {
    login,
    signup,
    logout,
    getLoggedinUser,
    getUser,
    getUserBugs,
    queryUsers,
    removeUser
}

function login(credentials) {
    return _request('/api/auth/login', 'POST', credentials).then(_setLoggedinUser)
}

function signup(userInfo) {
    return _request('/api/auth/signup', 'POST', userInfo)
}

function logout() {
    return _request('/api/auth/logout', 'POST').then(() => {
        sessionStorage.removeItem(STORAGE_KEY)
    })
}

function getLoggedinUser() {
    const user = sessionStorage.getItem(STORAGE_KEY)
    return user ? JSON.parse(user) : null
}

function getUserBugs(userId) {
    return _request(`/api/user/${userId}/bugs`)
}

function queryUsers() {
    return _request('/api/user')
}

function removeUser(userId) {
    return _request(`/api/user/${userId}`, 'DELETE')
}

function _setLoggedinUser(user) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
}

function _request(url, method = 'GET', body) {
    const options = { method, headers: {} }
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
    }
    return fetch(url, options).then(res => {
        if (!res.ok) return res.text().then(message => Promise.reject(new Error(message || res.statusText)))
        if (res.status === 204) return null
        return res.json()
    })
}

function getUser(userId) {
    return _request(`/api/user/${userId}`)
}