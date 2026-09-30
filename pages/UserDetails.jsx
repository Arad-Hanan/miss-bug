const { useEffect, useState } = React
const { useParams } = ReactRouterDOM

import { userService } from '../services/user.service.front.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

export function UserDetails({ loggedinUser }) {
    const { userId } = useParams()
    const [bugs, setBugs] = useState(null)
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        if (!loggedinUser) return
        Promise.all([userService.getUser(userId), userService.getUserBugs(userId)])
            .then(([user, result]) => {
                setProfile(user)
                setBugs(result.bugs)
            })
            .catch(err => showErrorMsg('Could not load this profile', err))
    }, [userId, loggedinUser])

    if (!loggedinUser) return <section className="main-content"><h2>Sign in to view profiles</h2></section>
    return <section className="user-details main-content">
        <h2>{userId === loggedinUser._id ? 'Your profile' : 'User profile'}</h2>
        <h3>{profile ? profile.fullname : 'Loading profile...'}</h3>
        <p>Reported bugs</p>
        <BugList bugs={bugs} />
    </section>
}