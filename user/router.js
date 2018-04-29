const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
const { Users } = require('./models');

const jsonParser = bodyParser.json();

// require User

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email'];
  for (let i = 0; i < requiredFields.length; i += 1) {
    if (!(requiredFields[i] in req.body)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: requiredFields[i],
      });
    }
  }

  const fieldsToTrim = ['username', 'password', 'email'];
  const nonTrimmedFields = fieldsToTrim.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedFields) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedFields,
    });
  }

  // check for correct length of userName and password

  const sizedFields = {
    username: {
      min: 1,
    },
    password: {
      min: 10,
      max: 72,
    },
  };

  const tooLargeField = Object.keys(sizedFields).find(field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

  if (req.body.password.length < 10) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Password must be at least 10 characters long',
    });
  } else if (tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Password must not be more than 72 characterslong',
    });
  }
  return Users
    .find({ username: req.body.username })
    // .count()
    .then((users) => {
      if (users.length > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username',
        });
      }
      // hashPassword is a static function defined on the userSchema which
      // uses bcryptjs to hash the password
      return Users.hashPassword(req.body.password);
    })
    .then(hash => Users
      .create({
        name: {
          first: req.body.firstName,
          last: req.body.lastName,
        },
        email: req.body.email,
        username: req.body.username,
        password: hash,
      })
      .then(user => res.status(201).json(user.serialize()))
      .catch((err) => {
        if (err.reason === 'ValidationError') {
          res.status(err.code).json(err);
        }
        res.status(500).send({ code: 500, message: 'Internal server error' });
      }));
});
module.exports = router;
