const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');

describe('/search endpoint', () => {
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
            userId = foundUser[0]._id;
          });
        done();
      });
  });

  beforeEach((done) => {
    const user = {
      username: 'test123',
      _id: userId,
    };
    authToken = jwt.sign({ user }, JWT_SECRET, {
      subject: user.username,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });
    done();
  });

  beforeEach(() => {
    const newBook = {
      userId: 'Test123',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };

    return BookToSwap.create(newBook);
  });

  afterEach(() => {
    console.log('Deleting books');
    return BookToSwap.deleteMany();
  });

  afterEach(() => {
    console.log('Deleting users');
    return Users.deleteMany();
  });

  afterAll(() => closeServer());

  test('Should return all books in the database', (done) => {
    return request(app).get('/search')
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
        done();
      });
  });
});
