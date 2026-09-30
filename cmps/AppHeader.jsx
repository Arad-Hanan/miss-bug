const { NavLink } = ReactRouterDOM

export function AppHeader({ loggedinUser, onLogout }) {
    return <header className="app-header main-content single-row">
        <h1>Miss Bug</h1>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/bug">Bugs</NavLink>
            <NavLink to="/about">About</NavLink>
            {loggedinUser && <NavLink to={`/user/${loggedinUser._id}`}>Profile</NavLink>}
            {loggedinUser && loggedinUser.isAdmin && <NavLink to="/admin/users">Users</NavLink>}
            {loggedinUser
                ? <button type="button" onClick={onLogout}>Logout ({loggedinUser.fullname})</button>
                : <NavLink to="/login">Login / Sign up</NavLink>}
        </nav>
    </header>
}
