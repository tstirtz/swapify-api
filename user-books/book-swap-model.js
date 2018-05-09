const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

const bookToSwapSchema = mongoose.Schema({
  userId: String,
  title: String,
  author: String,
});

bookToSwapSchema.methods.serialize = function () {
  return {
    title: this.title,
    author: this.author,
  };
};

const BookToSwap = mongoose.model('BookToSwap', bookToSwapSchema);

module.exports = { BookToSwap };
