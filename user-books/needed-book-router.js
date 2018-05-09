const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { NeededBook } = require('./needed-book-model');

router.post('/', (req, res) =>
  NeededBook.findOne({ userId: req.userId, title: req.title })
    .then((item) => {
      if (item) {
        return res.status(422).json({
          code: 422,
          message: 'Already exists as a needed book',
        });
      }
      return NeededBook.create({
        userId: req.userId,
        title: req.title,
        author: req.author,
      });
    }).then(book => res.status(201).json(book.serialize()))
    .catch(err => console.log(err)));

module.exports = router;
