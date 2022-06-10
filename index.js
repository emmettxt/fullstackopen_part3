const express = require('express')
const app = express()

app.use(express.json())
const morgan = require('morgan')
app.use(
    morgan((tokens, req, res) =>{
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            req.method === 'POST'?JSON.stringify(req.body):null
        ].join(' ')
    }))
// app.use(morgan('person'))
let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toUTCString()}</p>`)
})
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(note => note.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})
const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}
app.post('/api/persons', (req, res) => {

    const body = req.body
    if (!body.name || !body.number) {
        const error = body.name ? 'number missing' : 'name missing'
        return res.status(400).json({
            error
        })
    }
    const found = persons.find(person => person.name === body.name)
    if (found) {
        return res.status(403).json({
            error: `phonebook entry for ${body.name} already exsits`
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(person)

    res.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)