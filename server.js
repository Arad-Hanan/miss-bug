import express from 'express'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'

import { bugService } from './services/bug.service.js'
import { authService } from './services/auth.service.js'
import { userService } from './services/user.service.js'

const app = express()
const port = process.env.PORT || 3030

app.use(express.json())
app.use(cookieParser())
app.use((req, res, next) => {
    if (/^\/(data|seed|node_modules)(\/|$)/.test(req.path) ||
        ['/server.js', '/package.json', '/package-lock.json', '/render.yaml', '/services/bug.service.js', '/services/user.service.js', '/services/auth.service.js', '/services/util.service.js'].includes(req.path)) {
        return res.sendStatus(404)
    }
    next()
})
app.use(express.static('.'))

app.get('/healthz', (req, res) => res.send('ok'))

app.get('/api/bug', (req, res) => {
    bugService.query(req.query)
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err.message))
})

app.get('/api/bug/pdf', (req, res) => {
    bugService.getAll()
        .then(bugs => {
            res.type('application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename="miss-bugs.pdf"')

            const document = new PDFDocument({ margin: 48 })
            document.pipe(res)
            document.fontSize(20).text('MissBug Report')
            document.moveDown()

            bugs.forEach(bug => {
                document.fontSize(14).text(bug.title)
                document.fontSize(10).text(`Severity: ${bug.severity}`)
                document.text(bug.description || 'No description provided.')
                document.text(`Labels: ${(bug.labels || []).join(', ') || 'None'}`)
                document.moveDown()
            })

            document.end()
        })
        .catch(err => res.status(500).send(err.message))
})

app.get('/api/bug/:bugId', (req, res) => {
    const visitedBugIds = _getVisitedBugIds(req.cookies.visitedBugs)

    bugService.getById(req.params.bugId)
        .then(bug => {
            if (!visitedBugIds.includes(bug._id)) {
                if (visitedBugIds.length >= 3) {
                    console.log('User visited at the following bugs:', visitedBugIds)
                    return res.status(401).send('Wait for a bit')
                }

                visitedBugIds.push(bug._id)
                res.cookie('visitedBugs', visitedBugIds, {
                    maxAge: 7 * 1000,
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production'
                })
            }

            console.log('User visited at the following bugs:', visitedBugIds)
            res.send(bug)
        })
        .catch(err => res.status(404).send(err.message))
})

app.post('/api/bug', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => bugService.save(req.body, user))
        .then(savedBug => res.status(201).send(savedBug))
        .catch(err => res.status(401).send(err.message))
})

app.put('/api/bug/:bugId', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => bugService.getById(req.params.bugId).then(bug => ({ user, bug })))
        .then(({ user, bug }) => {
            if (!_canManageBug(user, bug)) throw new Error('Only the creator or an admin can update this bug')
            return bugService.save({ ...req.body, _id: bug._id })
        })
        .then(savedBug => res.send(savedBug))
        .catch(err => res.status(err.message === 'Bug not found' ? 404 : 403).send(err.message))
})

app.delete('/api/bug/:bugId', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => bugService.getById(req.params.bugId).then(bug => ({ user, bug })))
        .then(({ user, bug }) => {
            if (!_canManageBug(user, bug)) throw new Error('Only the creator or an admin can delete this bug')
            return bugService.remove(bug._id)
        })
        .then(() => res.sendStatus(204))
        .catch(err => res.status(err.message === 'Bug not found' ? 404 : 403).send(err.message))
})

app.post('/api/auth/signup', (req, res) => {
    authService.signup(req.body)
        .then(user => res.status(201).send(user))
        .catch(err => res.status(400).send(err.message))
})

app.post('/api/auth/login', (req, res) => {
    authService.login(req.body)
        .then(({ user, token }) => {
            authService.setLoginToken(res, token)
            res.send(user)
        })
        .catch(err => res.status(401).send(err.message))
})

app.post('/api/auth/logout', (req, res) => {
    authService.logout(res)
    res.sendStatus(204)
})

app.get('/api/auth/me', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => res.send(user))
        .catch(err => res.status(401).send(err.message))
})

app.get('/api/user/:userId/bugs', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => {
            if (user._id !== req.params.userId && !user.isAdmin) throw new Error('Not authorized')
            return bugService.query({ ...req.query, creatorId: req.params.userId })
        })
        .then(result => res.send(result))
        .catch(err => res.status(403).send(err.message))
})

app.get('/api/user/:userId', (req, res) => {
    authService.getLoggedinUser(req)
        .then(loggedinUser => {
            if (loggedinUser._id !== req.params.userId && !loggedinUser.isAdmin) throw new Error('Not authorized')
            return userService.getById(req.params.userId)
        })
        .then(user => res.send(userService.toMiniUser(user)))
        .catch(err => res.status(403).send(err.message))
})

app.get('/api/user', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => {
            if (!user.isAdmin) throw new Error('Admin access required')
            return userService.query()
        })
        .then(users => res.send(users))
        .catch(err => res.status(403).send(err.message))
})

app.delete('/api/user/:userId', (req, res) => {
    authService.getLoggedinUser(req)
        .then(user => {
            if (!user.isAdmin) throw new Error('Admin access required')
            return bugService.hasBugsByCreator(req.params.userId)
        })
        .then(hasBugs => {
            if (hasBugs) throw new Error('Cannot delete a user who owns bugs')
            return userService.remove(req.params.userId)
        })
        .then(() => res.sendStatus(204))
        .catch(err => res.status(403).send(err.message))
})

app.get('*', (req, res) => res.sendFile('index.html', { root: '.' }))

app.listen(port, () => console.log(`Server ready at port ${port}`))

function _canManageBug(user, bug) {
    return user.isAdmin || (bug.creator && bug.creator._id === user._id)
}

function _getVisitedBugIds(visitedBugs) {
    if (!Array.isArray(visitedBugs)) return []
    return visitedBugs.filter(bugId => typeof bugId === 'string' && /^[A-Za-z0-9]+$/.test(bugId))
}
