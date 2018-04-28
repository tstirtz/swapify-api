const express = require('express');

const app = express();
const morgan = require('morgan');
const { CLIENT_ORIGIN } = require('./config');
const cors = require('cors');
const usersRouter = require('./user/router');

app.use(morgan('common'));
app.use(cors({ origin: CLIENT_ORIGIN }));

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.use('/sign-up', usersRouter);

module.exports = app;
