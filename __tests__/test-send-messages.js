const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const { Message } = require('../messages/message-model');

describe('/send-message endpoint', () => {
  let userId;
  let authToken;

  beforeAll(() => runServer(TEST_DATABASE_URL, 4000));
  beforeEach((done) => {
    const user = {
      first: 'Test',
      last: 'Test',
      email: 'test@test.com',
      username: 'testUser',
      password: 'anothertest',
    };
    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        Users.find({})
          .then((foundUser) => {
            console.log(foundUser[0]._id);
            userId = foundUser[0]._id;
            console.log(userId);
            done();
          });
      });
  });

  beforeEach(() => {
    const userCredentials = {
      username: 'testUser',
      password: 'anothertest',
    };

    return request(app).post('/login')
      .send(userCredentials)
      .then((response) => {
        console.log(response.body);
        authToken = response.body.jwt;
        console.log(authToken);
      });
  });

  afterEach(() => {
    console.log('Deleting books');
    return BookToSwap.deleteMany();
  });

  afterEach(() => {
    console.log('Deleting users');
    return Users.deleteMany()
  });

  afterEach(() => {
    console.log('Deleting messages');
    return Message.deleteMany();
  });

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('Should create a new message', (done) => {
    const newMessage = {
      to: 'otherUser',
      from: 'testUser',
      content: 'Hey there',
      timeStamp: '5/22/18',
    };

    return request(app).post('/send-message')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newMessage)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ message: 'Message sent' });
        done();
      });
  });

  test('Should return an error if a field is missing in request body', (done) => {
    const messageWithMissingField = {
      from: 'testUser',
      content: 'Hey there',
      timeStamp: '5/22/18',
    };

    return request(app).post('/send-message')
      .send(messageWithMissingField)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(422);
        done();
      });
  });
});
