const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');

describe('/book-to-swap end point', () => {
  let userId;
  beforeAll(() => {
    return runServer(TEST_DATABASE_URL, 4000);
  });
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
            userId = foundUser._id;
          })
      });
  });
  afterEach(() => {
    console.log('Deleting db');
    return BookToSwap.deleteMany();
  })
  afterAll(() => {
    return closeServer();
  });

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });
  it('should return a book', () => {
    const newBook = {
      userId: 'Test123',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    }

    const expectedBook = {
      title: 'Enders Game',
      author: 'Orson Scott Card',
    }

    const user = {
      username: 'test123',
      _id: userId,
    }
    const authToken = jwt.sign({ user }, JWT_SECRET, {
      subject: user.username,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });

    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual(expectedBook);
      });
  });
});
