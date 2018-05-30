const express = require('express');

const router = express.Router();
const passport = require('passport');
const { BookToSwap } = require('./book-swap-model');
const { jwtStrategy } = require('../auth/strategies');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.post('/', jwtAuth, (req, res) => {
  return BookToSwap.find({ userId: req.body.userId, title: req.body.title })
    .then((item) => {
      if (item.length > 0) {
        return Promise.reject({
          code: 422,
          message: 'Already exists as a needed book',
        });
      }
      return BookToSwap.create({
        userId: req.body.userId,
        username: req.body.username,
        title: req.body.title,
        author: req.body.author,
      });
    }).then(book => res.status(201).json('Book added successfully'))
    .catch((err) => {
      console.log(err);
      if (err.code === 422) {
        return res.status(err.code).json(err);
      }
      return res.status(500).send({ code: 500, message: 'Internal server error' });
    });
});

module.exports = router;
