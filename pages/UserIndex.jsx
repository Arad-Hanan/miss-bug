const { useEffect, useState } = React

import { userService } from '../services/user.service.front.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserIndex({ loggedinUser }) {
    const [users, setUsers] = useState(null)

    function loadUsers() {
        userService.queryUsers()
            .then(setUsers)
            .catch(err => showErrorMsg('Could not load users', err))
    }

    useEffect(() => {
        if (loggedinUser && loggedinUser.isAdmin) loadUsers()
    }, [loggedinUser])

    function onRemoveUser(userId) {
        userService.removeUser(userId)
            .then(() => {
                setUsers(currUsers => currUsers.filter(user => user._id !== userId))
                showSuccessMsg('User removed')
            })
            .catch(err => showErrorMsg('Could not remove user', err))
    }

    if (!loggedinUser || !loggedinUser.isAdmin) return <section className="main-content"><h2>Admin access required</h2></section>
    return <section className="user-index main-content">
        <h2>Users</h2>
        {!users && <p>Loading users...</p>}
        {users && <table>
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>{users.map(user => <tr key={user._id}>
                <td>{user.fullname}</td>
                <td>{user.username}</td>
                <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                <td>{user.username !== 'admin' && <button onClick={() => onRemoveUser(user._id)}>Remove</button>}</td>
            </tr>)}</tbody>
        </table>}
    </section>
}