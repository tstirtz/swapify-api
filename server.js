const mongoose = require ('mongoose');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

let port;
let server;

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
    })
  })
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

if (require.main === module) {
  runServer(DATABASE_URL).catch(err=> console.log(err));
}

module.exports = { runServer, closeServer };
