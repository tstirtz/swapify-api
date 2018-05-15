const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bookToSwapSchema = mongoose.Schema({
  userId: String,
  title: String,
  author: String,
});

bookToSwapSchema.methods.serialize = function () {
  return {
    userId: this.userId,
    title: this.title,
    author: this.author,
  };
};

const BookToSwap = mongoose.model('BookToSwap', bookToSwapSchema);

module.exports = { BookToSwap };
