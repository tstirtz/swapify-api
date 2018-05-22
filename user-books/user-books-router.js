const express = require('express');

const router = express.Router({ mergeParams: true });
const passport = require('passport');
// const bodyParser = require('body-parser');
const { BookToSwap } = require('./book-swap-model');
const { jwtStrategy } = require('../auth/strategies');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.get('/', jwtAuth, (req, res) => {
  console.log(req.params.id);
  return BookToSwap.find({ userId: `${req.params.id}` })
    .then((books) => {
      // if (books.length === 0) {
      //   return Promise.reject({
      //     code: 204,
      //     message: 'No books were found for the user',
      //   });
      // }
      return res.status(200).json(books);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Internal server error. Please try again' })
    });
});

module.exports = router;
