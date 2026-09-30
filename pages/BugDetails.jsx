const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.front.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {

    const [bug, setBug] = useState(null)
    const { bugId } = useParams()

    useEffect(() => {
        bugService.getById(bugId)
            .then(bug => setBug(bug))
            .catch(err => showErrorMsg(`Cannot load bug`, err))
    }, [bugId])

    return <div className="bug-details main-content">
        <h2>Bug Details</h2>
        {!bug && <p className="loading">Loading....</p>}
        {
            bug && 
            <div>
                <h3>{bug.title}</h3>
                <p className="severity">Severity: <span>{bug.severity}</span></p>
                <p>{bug.description || 'No description provided.'}</p>
                {bug.creator && <p>Reported by {bug.creator.fullname}</p>}
                {!!(bug.labels && bug.labels.length) && <p>Labels: {bug.labels.join(', ')}</p>}
            </div>
        }
        <button><Link to="/bug">Back to List</Link></button>
    </div>

}