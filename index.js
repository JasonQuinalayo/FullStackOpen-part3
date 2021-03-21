const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(express.json());
morgan.token('log-post', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :log-post'))
app.use(express.static('build'))

let persons = [
  {
    id:1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id:2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id:3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id:4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  }
]

const generateId = () => (Math.floor(Math.random() * 10000000))

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for ${persons.length} people <br /> ${new Date()}`)
})

app.get('/api/persons/:id', (req, res) => {
  const person = persons.find(element => element.id === + req.params.id)
  if (person) res.json(person)
  else res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
  persons = persons.filter(element => element.id !== + req.params.id)
  console.log(`Deleted person with ID ${req.params.id}`)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).send('Missing name or number')
  }
  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).send(`${req.body.name} already in the phonebook!`)
  }
  const person = {
    id: generateId(),
    name: req.body.name,
    number: req.body.number
  }
  persons.push(person)
  res.send(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})