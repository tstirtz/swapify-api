const express = require('express');
const app = express();
const {CLIENT_ORIGIN} = require('./config');
const cors = require('./cors');

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

module.exports = app;
