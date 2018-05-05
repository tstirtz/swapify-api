const express = require('express');

const morgan = require('morgan');
const morganBody = require('morgan-body');
const passport = require('passport');
const bodyParser = require('body-parser');
const { CLIENT_ORIGIN } = require('./config');
const cors = require('cors');
const usersRouter = require('./user/router');
const loginRouter = require('./auth/login-router');
const { localStrategy } = require('./auth/strategies');

const app = express();
const jsonParser = bodyParser.json();

passport.use(localStrategy);

app.use(morgan('common'));
morganBody(app);
app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:3000'] }));

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.use('/sign-up', usersRouter);
app.use('/login', jsonParser, loginRouter);

module.exports = app;
