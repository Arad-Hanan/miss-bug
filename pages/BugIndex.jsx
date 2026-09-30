const { useState, useEffect } = React

import { bugService } from '../services/bug.service.front.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex({ loggedinUser }) {
    const [bugs, setBugs] = useState(null)
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(5)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(loadBugs, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(result => {
                const lastPage = Math.max(0, Math.ceil(result.total / result.pageSize) - 1)
                if (filterBy.pageIdx > lastPage) {
                    setFilterBy(prevFilter => ({ ...prevFilter, pageIdx: lastPage }))
                    return
                }
                setBugs(result.bugs)
                setTotal(result.total)
                setPageSize(result.pageSize)
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                loadBugs()
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            description: prompt('Bug description?', ''),
            severity: +prompt('Bug severity?', 3),
            labels: (prompt('Labels (comma separated)?', '') || '').split(',').map(label => label.trim()).filter(Boolean)
        }
        if (!bug.title) return

        bugService.save(bug)
            .then(() => {
                loadBugs()
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        if (!severity || severity === bug.severity) return

        const labels = (prompt('Labels (comma separated)?', (bug.labels || []).join(', ')) || '')
            .split(',').map(label => label.trim()).filter(Boolean)
        const bugToSave = { ...bug, severity, labels }

        bugService.save(bugToSave)
            .then(() => {
                loadBugs()
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy, pageIdx: 0 }))
    }

    function onChangePage(pageIdx) {
        setFilterBy(prevFilter => ({ ...prevFilter, pageIdx }))
    }

    const pageCount = Math.max(1, Math.ceil(total / pageSize))

    return <section className="bug-index main-content">
        
        <header>
            <h2>Bug List</h2>
            <div className="bug-index-actions">
                <a href="/api/bug/pdf" download="miss-bugs.pdf">Download PDF</a>
                {loggedinUser && <button onClick={onAddBug}>Add Bug</button>}
            </div>
        </header>
        
        <BugFilter 
            filterBy={filterBy} 
            onSetFilterBy={onSetFilterBy} />

        <BugList 
            bugs={bugs} 
            loggedinUser={loggedinUser}
            onRemoveBug={onRemoveBug} 
            onEditBug={onEditBug} />
        <nav className="pagination" aria-label="Bug list pages">
            <button disabled={!filterBy.pageIdx} onClick={() => onChangePage(filterBy.pageIdx - 1)}>Previous</button>
            <span>Page {filterBy.pageIdx + 1} of {pageCount} · {total} bugs</span>
            <button disabled={filterBy.pageIdx + 1 >= pageCount} onClick={() => onChangePage(filterBy.pageIdx + 1)}>Next</button>
        </nav>
    </section>
}
