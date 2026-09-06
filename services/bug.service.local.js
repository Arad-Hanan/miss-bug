export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy) {
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
    return fetch(`/api/bug/${bugId}/remove`)
        .then(_checkResponse)
}

function save(bug) {
    const queryParams = new URLSearchParams({
        id: bug._id || '',
        title: bug.title || '',
        description: bug.description || '',
        severity: bug.severity || 0
    })
    return fetch(`/api/bug/save?${queryParams}`)
        .then(_checkResponse)
        .then(res => res.json())
}

function _checkResponse(res) {
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
    return res
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}