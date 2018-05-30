const request = require('supertest');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const { Message } = require('../messages/message-model');

describe('/:username/messages endpoint', () => {
  let userId;
  let authToken;

  beforeAll(() => runServer(TEST_DATABASE_URL, 4000));
  beforeEach(() => {
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
            userId = foundUser[0]._id;
            return foundUser;
          });
      });
  });

  beforeEach(() => {
    const userCredentials = {
      username: 'testUser',
      password: 'anothertest',
    }

    return request(app).post('/login')
      .send(userCredentials)
      .then((response) => {
        authToken = response.body.jwt;
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
    return Message.deleteMany()
  });

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('Should return error if no username is provided', (done) => {
    const undefinedUsername = undefined;
    return request(app).get(`/${undefinedUsername}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(422);
        expect(res.body).toHaveProperty('message');
        done();
      });
  });
  test('Should return an empty array if the user does not have any messages', (done) => {
    return request(app).get('/testUser/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual([]);
        done();
      });
  });

  test('Should return messages to/from a user', (done) => {
    const newMessage = {
      to: 'otherUser',
      from: 'testUser',
      content: 'Hey there',
      timeStamp: '5/22/18',
    };

    return request(app).post('/send-message')
      .send(newMessage)
      .set('Authorization', `Bearer ${authToken}`)
      .then(() =>
        request(app).get('/testUser/messages')
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toEqual(1);
            done();
          }));
  });
});
