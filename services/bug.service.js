import { utilService } from './util.service.js'

const bugsPath = utilService.getDataFilePath('bugs.json')
const bugs = utilService.readJsonFile(bugsPath)

export const bugService = {
    query,
    getAll,
    getById,
    save,
    remove,
    hasBugsByCreator
}

function getAll() {
    return Promise.resolve(bugs.slice())
}

function query(filterBy = {}) {
    let filteredBugs = bugs.slice()
    const { txt, minSeverity, labels, sortBy, sortDir, pageIdx, creatorId } = filterBy

    if (txt) {
        const searchText = txt.toLowerCase()
        filteredBugs = filteredBugs.filter(bug =>
            bug.title.toLowerCase().includes(searchText) ||
            bug.description.toLowerCase().includes(searchText))
    }

    if (minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= +minSeverity)
    }

    if (labels) {
        const requestedLabels = Array.isArray(labels) ? labels : labels.split(',').filter(Boolean)
        filteredBugs = filteredBugs.filter(bug =>
            requestedLabels.some(label => (bug.labels || []).includes(label)))
    }

    if (creatorId) {
        filteredBugs = filteredBugs.filter(bug => bug.creator && bug.creator._id === creatorId)
    }

    if (sortBy && ['title', 'severity', 'createdAt'].includes(sortBy)) {
        const direction = +sortDir === -1 ? -1 : 1
        filteredBugs.sort((bugA, bugB) => {
            const valueA = bugA[sortBy]
            const valueB = bugB[sortBy]
            return (valueA > valueB ? 1 : valueA < valueB ? -1 : 0) * direction
        })
    }

    const pageSize = 5
    const page = Math.max(0, Number.parseInt(pageIdx, 10) || 0)
    const total = filteredBugs.length
    const pagedBugs = filteredBugs.slice(page * pageSize, (page + 1) * pageSize)
    return Promise.resolve({ bugs: pagedBugs, total, pageIdx: page, pageSize })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(new Error('Bug not found'))
    return Promise.resolve(bug)
}

function save(bugToSave, loggedinUser) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (bugIdx < 0) return Promise.reject(new Error('Bug not found'))
        const currentBug = bugs[bugIdx]
        const updatedBug = {
            ...currentBug,
            title: bugToSave.title ?? currentBug.title,
            description: bugToSave.description ?? currentBug.description,
            severity: bugToSave.severity == null ? currentBug.severity : +bugToSave.severity,
            labels: Array.isArray(bugToSave.labels) ? bugToSave.labels : currentBug.labels || []
        }
        bugs.splice(bugIdx, 1, updatedBug)
        return _saveBugs().then(() => bugs[bugIdx])
    }

    const bug = {
        _id: utilService.makeId(),
        title: bugToSave.title || 'Untitled bug',
        description: bugToSave.description || '',
        severity: +bugToSave.severity || 1,
        createdAt: Date.now(),
        labels: Array.isArray(bugToSave.labels) ? bugToSave.labels : [],
        creator: { _id: loggedinUser._id, fullname: loggedinUser.fullname }
    }
    bugs.push(bug)
    return _saveBugs().then(() => bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx < 0) return Promise.reject(new Error('Bug not found'))
    bugs.splice(bugIdx, 1)
    return _saveBugs()
}

function _saveBugs() {
    return utilService.writeJsonFile(bugsPath, bugs)
}

function hasBugsByCreator(userId) {
    return Promise.resolve(bugs.some(bug => bug.creator && bug.creator._id === userId))
}
