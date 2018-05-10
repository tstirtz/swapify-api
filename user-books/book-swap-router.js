const express = require('express');

const router = express.Router();
const passport = require('passport');
// const bodyParser = require('body-parser');
const { BookToSwap } = require('./book-swap-model');
const { jwtStrategy } = require('../auth/strategies');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.post('/', jwtAuth, (req, res) => {
  console.log(req.body.userId);
  console.log(req.body.title);
  console.log(req.body.author);
  return BookToSwap.find({ userId: req.body.userId, title: req.body.title })
    .then((item) => {
      console.log(item);
      if (item.length > 0) {
        return Promise.reject({
          code: 422,
          message: 'Already exists as a needed book',
        });
      }
      return BookToSwap.create({
        userId: req.body.userId,
        title: req.body.title,
        author: req.body.author,
      });
    }).then(book => res.status(201).json(book.serialize()))
    .catch((err) => {
      console.log(err);
      if (err.code === 422) {
        return res.status(err.code).json(err);
      }
      return res.status(500).send({ code: 500, message: 'Internal server error' });
    });
});

module.exports = router;
