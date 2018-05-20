const express = require('express');

const router = express.Router({ mergeParams: true });

const passport = require('passport');
const { jwtStrategy } = require('../auth/strategies');
const { Message } = require('./message-model');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.get('/', (req, res) => {
  console.log(req.params.username);
  if (req.params.username === undefined) {
    return res.status(422).json({ message: 'Username parameter is undefined, please try again.' });
  }
  return Message.find({ $or: [{ to: `${req.params.username}` }, { from: `${req.params.username}` }] })
    .then(messages => res.status(200).json(messages))
    .catch(err => res.status(err.code).json());
});

module.exports = router;
