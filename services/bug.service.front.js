export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}) {
    const queryParams = new URLSearchParams(filterBy)
    return fetch(`/api/bug?${queryParams}`)
        .then(_checkResponse)
        .then(res => res.json())
}

function getById(bugId) {
    return fetch(`/api/bug/${bugId}`)
        .then(_checkResponse)
        .then(res => res.json())
}

function remove(bugId) {
    return fetch(`/api/bug/${bugId}`, { method: 'DELETE' })
        .then(_checkResponse)
}

function save(bug) {
    return fetch(bug._id ? `/api/bug/${bug._id}` : '/api/bug', {
        method: bug._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bug)
    })
        .then(_checkResponse)
        .then(res => res.json())
}

function _checkResponse(res) {
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
    return res
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, labels: '', sortBy: '', sortDir: 1, pageIdx: 0 }
}