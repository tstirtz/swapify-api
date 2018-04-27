const { DATABASE_URL } = require('../config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

const userSchema = mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  email: String,
  username: String,
  password: String,
});

userSchema.methods.serialize = function () {
  return {
    name: {
      first: this.name.first,
      last: this.name.last,
    },
    email: this.email,
    username: this.username,
  };
};


const Users = mongoose.model('Users', userSchema);

module.exports = { Users };
