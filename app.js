const express = require('express');
const app = express();

app.get('/', (res, req) => {
    res.status(200).send('Hello World!');
});

module.exports = app;
