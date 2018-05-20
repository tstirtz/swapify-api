const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const messageSchema = mongoose.Schema({
  to: String,
  from: String,
  content: String,
  timeStamp: String,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
