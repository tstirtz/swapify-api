const express = require('express');

const router = express.Router({ mergeParams: true });
const passport = require('passport');
const { jwtStrategy } = require('../auth/strategies');
const { BookToSwap } = require('../user-books/book-swap-model');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.get('/', jwtAuth, (req, res) => {
  BookToSwap.find((err, books) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).json(books);
  });
});

module.exports = router;
