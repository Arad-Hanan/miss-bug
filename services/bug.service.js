import { utilService } from './util.service.js'

const bugsPath = './data/bugs.json'
const bugs = utilService.readJsonFile(bugsPath)

export const bugService = {
    query,
    getById,
    save,
    remove
}

function query(filterBy = {}) {
    let filteredBugs = bugs.slice()
    const { txt, minSeverity } = filterBy

    if (txt) {
        const searchText = txt.toLowerCase()
        filteredBugs = filteredBugs.filter(bug =>
            bug.title.toLowerCase().includes(searchText) ||
            bug.description.toLowerCase().includes(searchText))
    }

    if (minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= +minSeverity)
    }

    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(new Error(`Bug not found: ${bugId}`))
    return Promise.resolve(bug)
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (bugIdx < 0) return Promise.reject(new Error(`Bug not found: ${bugToSave._id}`))
        bugs.splice(bugIdx, 1, { ...bugs[bugIdx], ...bugToSave })
        return _saveBugs().then(() => bugs[bugIdx])
    }

    const bug = {
        _id: utilService.makeId(),
        title: bugToSave.title || 'Untitled bug',
        description: bugToSave.description || '',
        severity: +bugToSave.severity || 1,
        createdAt: Date.now()
    }
    bugs.push(bug)
    return _saveBugs().then(() => bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx < 0) return Promise.reject(new Error(`Bug not found: ${bugId}`))
    bugs.splice(bugIdx, 1)
    return _saveBugs()
}

function _saveBugs() {
    return utilService.writeJsonFile(bugsPath, bugs)
}