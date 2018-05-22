const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const { Message } = require('../messages/send-message-router');
const { userId } = require('./test-user-books');

let authToken;

beforeAll(() => {
  const user = {
    username: 'testUser',
    _id: userId,
  };
  authToken = jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
});

describe('/send-message endpoint', () => {
  console.log(authToken);
  const newMessage = {
    to: 'user123',
    from: 'testUser',
    content: 'Hey there',
    timeStamp: '5/22/2018',
  }

  it('Should create a new message', (done) => {
    return request(app).post('/send-message')
      .send(newMessage)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: 'Message sent' });
        done();
      });
  });
});
