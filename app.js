const express = require('express');

const morgan = require('morgan');
const morganBody = require('morgan-body');
const passport = require('passport');
const bodyParser = require('body-parser');
const { CLIENT_ORIGIN } = require('./config');
const cors = require('cors');
const usersRouter = require('./user/router');
const loginRouter = require('./auth/login-router');
const bookToSwapRouter = require('./user-books/book-swap-router');
const getUserBooksRouter = require('./user-books/user-books-router');
const searchRouter = require('./search/search-router');
const sendMessageRouter = require('./messages/send-message-router');
const getMessagesRouter = require('./messages/get-messages-router');
const deleteBookRouter = require('./user-books/delete-book-router');
const { localStrategy } = require('./auth/strategies');

const app = express();
const jsonParser = bodyParser.json();

passport.use(localStrategy);

app.use(morgan('common'));
morganBody(app);

const corsOptions = {
  origin: CLIENT_ORIGIN,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// app.use(cors({ origin: [CLIENT_ORIGIN, 'http://localhost:3000'] }));

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.use('/sign-up', cors(corsOptions), usersRouter);
app.use('/login', cors(corsOptions), jsonParser, loginRouter);
app.use('/book-to-swap', cors(corsOptions), jsonParser, bookToSwapRouter);
app.use('/user-books/:id', cors(corsOptions), getUserBooksRouter);
app.use('/search', cors(corsOptions), searchRouter);
app.use('/send-message', cors(corsOptions), jsonParser, sendMessageRouter);
app.use('/:username/messages', cors(corsOptions), getMessagesRouter);
app.use('/:bookId/delete-book', cors(corsOptions), deleteBookRouter);

module.exports = app;
