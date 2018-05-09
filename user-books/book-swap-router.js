const express = require('express');

const router = express.Router();
// const bodyParser = require('body-parser');
const { BookToSwap } = require('./book-swap-model');

router.post('/', (req, res) =>
  BookToSwap.findOne({ userId: req.userId, title: req.title })
    .then((item) => {
      if (item) {
        return res.status(422).json({
          code: 422,
          message: 'Already exists as a needed book',
        });
      }
      return BookToSwap.create({
        userId: req.userId,
        title: req.title,
        author: req.author,
      });
    }).then(book => res.status(201).json(book.serialize()))
    .catch(err => console.log(err)));

module.exports = router;
