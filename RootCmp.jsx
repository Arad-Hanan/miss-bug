const Router = ReactRouterDOM.HashRouter
const { Route, Routes } = ReactRouterDOM
const { useState } = React

import { UserMsg } from './cmps/UserMsg.jsx'
import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { Home } from './pages/Home.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { UserDetails } from './pages/UserDetails.jsx'
import { UserIndex } from './pages/UserIndex.jsx'
import { userService } from './services/user.service.front.js'

export function App() {
    const [loggedinUser, setLoggedinUser] = useState(userService.getLoggedinUser())

    function onLogin(user) {
        setLoggedinUser(user)
    }

    function onLogout() {
        userService.logout()
            .then(() => setLoggedinUser(null))
    }

    return <Router>
        <div className="app-wrapper">
            <UserMsg />
            <AppHeader loggedinUser={loggedinUser} onLogout={onLogout} />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/bug" element={<BugIndex loggedinUser={loggedinUser} />} />
                    <Route path="/bug/:bugId" element={<BugDetails />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/login" element={<LoginSignup onLogin={onLogin} />} />
                    <Route path="/user/:userId" element={<UserDetails loggedinUser={loggedinUser} />} />
                    <Route path="/admin/users" element={<UserIndex loggedinUser={loggedinUser} />} />
                </Routes>
            </main>
            <AppFooter />
        </div>
    </Router>
}
