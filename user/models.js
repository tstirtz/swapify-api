const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

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

userSchema.methods.forAuthToken = function () {
  return {
    username: this.username,
    _id: this._id
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = password => bcrypt.hash(password, 10);


const Users = mongoose.model('Users', userSchema);

module.exports = { Users };
