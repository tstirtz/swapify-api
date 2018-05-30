const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Users } = require('../user/models');

const config = require('../config');

const router = express.Router();

const localAuth = passport.authenticate('local', { session: false });

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const createAuthToken = user =>
  jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256',
  });
router.post('/', localAuth, (req, res) => {
  console.log("login router called");
  const authToken = createAuthToken(req.user.forAuthToken());
  return res.json({ id: req.user._id, jwt: authToken, username: req.user.username });
});

module.exports = router;
