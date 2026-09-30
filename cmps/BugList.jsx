const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug, loggedinUser }) {

    function canManageBug(bug) {
        if (!loggedinUser) return false
        return loggedinUser.isAdmin || (bug.creator && bug.creator._id === loggedinUser._id)
    }

    if (!bugs) return <div>Loading...</div>
    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>
                    {canManageBug(bug) && <button onClick={() => onEditBug(bug)}>Edit</button>}
                    {canManageBug(bug) && <button onClick={() => onRemoveBug(bug._id)}>Remove</button>}
                </section>
            </li>
        ))}
    </ul >
}
