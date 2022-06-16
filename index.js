require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./modules/person')

app.use(express.json())
app.use(express.static('build'))
const morgan = require('morgan')
const { updateMany } = require('./modules/person')
app.use(
    morgan((tokens, req, res) => {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            req.method === 'POST' ? JSON.stringify(req.body) : null
        ].join(' ')
    }))

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => response.json(persons))
})

app.get('/info', (req, res) => {
    Person
        .find({})
        .then(persons =>
            res.send(
                `<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toUTCString()}</p>`
            )
        )
})
app.get('/api/persons/:id', (req, res, nxt) => {
    Person
        .findById(req.params.id)
        .then(person => res.json(person))
        .catch(err => nxt(err))

})
app.delete('/api/persons/:id', (req, res, nxt) => {
    Person
        .findByIdAndRemove(req.params.id)
        .then(result => res.status(204).end())
        .catch(err => nxt(err))
})
app.post('/api/persons', (req, res, next) => {

    const body = req.body
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person
        .save()
        .then(savedPerson => res.json(savedPerson))
        .catch(err => next(err))

})
app.put('/api/persons/:id', (req, res, nxt) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person
        .findByIdAndUpdate(
            req.params.id,
            person,
            { new: true, runValidators: true, context: 'query' }
        )
        .then(updatedPerson => res.json(updatedPerson))
        .catch(err => nxt(err))
})
const errorHandler = (err, req, res, nxt) => {
    console.error("Error Name", err.name)
    console.error("Error Message: ", err.message)
    switch (err.name) {
        case 'CastError':
            res.status(400).send({ error: 'malformatted id' })
            break;
        case 'MongoServerError':
            res.status(500).send({ error: err.message })
            break;
        case 'ValidationError':
            res.status(400).send({ error: err.message })
            break;
            
        default:
            nxt(err)
    }

}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})