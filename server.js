import express from 'express'

import { bugService } from './services/bug.service.js'

const app = express()
const port = process.env.PORT || 3030

app.use(express.json())
app.use(express.static('.'))

app.get('/api/bug', (req, res) => {
    bugService.query(req.query)
        .then(bugs => res.send(bugs))
        .catch(err => res.status(400).send(err.message))
})

app.get('/api/bug/save', (req, res) => {
    const { id: _id, title, description, severity } = req.query
    const bugToSave = { _id, title, description, severity: +severity }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => res.status(400).send(err.message))
})

    app.get('/api/bug/:bugId', (req, res) => {
        bugService.getById(req.params.bugId)
        .then(bug => res.send(bug))
        .catch(err => res.status(404).send(err.message))
    })

app.get('/api/bug/:bugId/remove', (req, res) => {
    bugService.remove(req.params.bugId)
        .then(() => res.send('OK'))
        .catch(err => res.status(404).send(err.message))
})

app.get('*', (req, res) => res.sendFile('index.html', { root: '.' }))

app.listen(port, () => console.log(`Server ready at port ${port}`))