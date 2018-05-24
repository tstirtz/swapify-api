const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const messageSchema = mongoose.Schema({
  to: String,
  from: String,
  content: String,
  timeStamp: String,
});

messageSchema.methods.serialize = function () {
  return {
    to: this.to,
    from: this.from,
    content: this.content,
    timeStamp: this.timeStamp,
  };
};

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
