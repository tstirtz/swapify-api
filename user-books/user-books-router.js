const express = require('express');

const router = express.Router({ mergeParams: true });
const passport = require('passport');
const { BookToSwap } = require('./book-swap-model');
const { jwtStrategy } = require('../auth/strategies');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.get('/', jwtAuth, (req, res) => {
  return BookToSwap.find({ userId: `${req.params.id}` })
    .then(books => res.status(200).json(books))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Internal server error. Please try again' });
    });
});

module.exports = router;
