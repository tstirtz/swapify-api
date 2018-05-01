const express = require('express');

const app = express();
const morgan = require('morgan');
const { CLIENT_ORIGIN } = require('./config');
const cors = require('cors');
const usersRouter = require('./user/router');
const morganBody = require('morgan-body');

app.use(morgan('common'));
morganBody(app);
app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:3000'] }));

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.use('/sign-up', usersRouter);

module.exports = app;
