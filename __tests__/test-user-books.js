const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const { Message } = require('../messages/message-model');

describe('/user-books/:id endpoint', () => {
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
            console.log(foundUser[0]._id);
            userId = foundUser[0]._id;
            console.log(userId);
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

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('Should return all books for a user', (done) => {
    const newBook = {
      userId: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    console.log(authToken);
    console.log(userId);
    return request(app).post('/book-to-swap')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBook)
      .then(() => {
        return request(app).get(`/user-books/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            done();
          });
      });
  });

  test('Should return empty array if no books are found for a user', (done) => {
    console.log(authToken);
    console.log(userId);
    return request(app).get(`/user-books/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual([]);
        done();
      });
  });
});
