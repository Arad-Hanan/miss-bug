const { useState } = React
const { Navigate } = ReactRouterDOM

import { userService } from '../services/user.service.front.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function LoginSignup({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false)
    const [form, setForm] = useState({ username: '', password: '', fullname: '' })
    const [loggedIn, setLoggedIn] = useState(false)

    function handleChange({ target }) {
        setForm(prevForm => ({ ...prevForm, [target.name]: target.value }))
    }

    function onSubmit(ev) {
        ev.preventDefault()
        const action = isSignup ? userService.signup(form).then(() => userService.login(form)) : userService.login(form)
        action.then(user => {
            onLogin(user)
            setLoggedIn(true)
            showSuccessMsg(isSignup ? 'Account created' : 'Welcome back')
        }).catch(err => showErrorMsg('Authentication failed', err))
    }

    if (loggedIn) return <Navigate to="/bug" replace />

    return <section className="auth-page main-content">
        <h2>{isSignup ? 'Create account' : 'Sign in'}</h2>
        <div className="auth-mode" role="group" aria-label="Authentication mode">
            <button type="button" aria-pressed={!isSignup} onClick={() => setIsSignup(false)}>Sign in</button>
            <button type="button" aria-pressed={isSignup} onClick={() => setIsSignup(true)}>Sign up</button>
        </div>
        <form onSubmit={onSubmit}>
            {isSignup && <label>Full name<input name="fullname" value={form.fullname} onChange={handleChange} required autoComplete="name" /></label>}
            <label>Username<input name="username" value={form.username} onChange={handleChange} required autoComplete="username" /></label>
            <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete={isSignup ? 'new-password' : 'current-password'} /></label>
            <button type="submit">{isSignup ? 'Create account' : 'Sign in'}</button>
        </form>
    </section>
}