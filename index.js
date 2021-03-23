/* eslint-disable consistent-return */
require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');

app.use(express.json());
morgan.token('log-post', (req) => (req.method === 'POST' ? JSON.stringify(req.body) : ''));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :log-post'));
app.use(express.static('build'));

const Person = require('./models/person');

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then((result) => {
    res.json(result);
  })
    .catch((err) => next(err));
});

app.get('/info', (req, res, next) => {
  Person.find({}).then((result) => {
    res.send(`Phonebook has info for ${result.length} people <br /> ${new Date()}`);
  })
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then((result) => {
    if (result) res.json(result);
    else res.status(404).end();
  })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end();
  })
    .catch((err) => next(err));
});

app.post('/api/persons', (req, res, next) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).send('Missing name or number');
  }
  Person.find({ name: req.body.name }).then((result) => {
    if (result.length !== 0) {
      return res.status(400).send(`${req.body.name} already in the phonebook!`);
    }
    const person = {
      name: req.body.name,
      number: req.body.number,
    };
    Person.create(person)
      .then(() => res.send(person))
      .catch((err) => next(err));
  })
    .catch((err) => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndUpdate(
    req.params.id, { number: req.body.number }, { runValidators: true, new: true },
  )
    .then((result) => res.json(result))
    .catch((err) => next(err));
});

app.use((req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
});

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
