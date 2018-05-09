const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

const neededBookSchema = mongoose.Schema({
  userId: String,
  title: String,
  author: String,
});

neededBookSchema.methods.serialize = function () {
  return {
    title: this.title,
    author: this.author,
  };
};

const NeededBook = mongoose.model('NeededBook', neededBookSchema);

module.exports = { NeededBook };
