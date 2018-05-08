const mongoose = require('mongoose');
const { PORT } = require('./config');
const app = require('./app');

function runServer(databaseUrl, port=PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, (err) => {
      if(err){
        return reject(err);
      }
      console.log(`mongoose is connected to ${databaseUrl}`);
      server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      });
      resolve();
    })
    .catch(err => {
      mongoose.disconnect();
      reject(err);
    });
  });
}

function closeServer(){
  return new Promise((resolve, reject) => {
    mongoose.disconnect()
    .then(() => {
      console.log('Closing server');
      server.close(err => {
        if(err){
          console.log(err);
          return reject(err);
        }
        resolve();
      });
    });
  });
}

module.exports = { runServer, closeServer };
