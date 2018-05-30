const express = require('express');

const router = express.Router();

const passport = require('passport');
const { jwtStrategy } = require('../auth/strategies');
const { Message } = require('./message-model');

const jwtAuth = passport.authenticate('jwt', { session: false });

passport.use(jwtStrategy);

router.post('/', jwtAuth, (req, res) => {
  const requiredFields = ['to', 'from', 'content', 'timeStamp'];
  for (let i = 0; i < requiredFields.length; i += 1) {
    if (!(requiredFields[i] in req.body)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: `Missing '${requiredFields[i]}' field`,
        location: `${requiredFields[i]}`,
      });
    }
  }
  return Message.create({
    to: req.body.to,
    from: req.body.from,
    content: req.body.content,
    timeStamp: req.body.timeStamp,
  })
    .then(() => res.status(200).json({ message: 'Message sent' }))
    .catch((err) => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err.message);
      }
      return res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

module.exports = router;
