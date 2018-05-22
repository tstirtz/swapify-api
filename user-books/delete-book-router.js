const express = require('express');

const router = express.Router({ mergeParams: true });

const passport = require('passport');
const { jwtStrategy } = require('../auth/strategies');
const { BookToSwap } = require('./book-swap-model.js');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.delete('/', jwtAuth, (req, res) => {
  BookToSwap.findOneAndRemove({ _id: `${req.params.bookId}` })
    .then((response) => {
      if (response === null) {
        return res.status(200).send(response);
      }
      return res.status(200).json(response.serialize());
    })
    .catch(err => res.status(422).json({ message: err.message }));
});

module.exports = router;
