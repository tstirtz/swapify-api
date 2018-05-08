const { DATABASE_URL } = require('./config');
const { runServer } = require('./server');

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.log(err));
}
