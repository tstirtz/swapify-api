const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');

xdescribe('/book-to-swap end point', () => {
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
    };

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

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('should return a book', (done) => {
    const newBook = {
      userId: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const expectedBook = {
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };

    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body).toContain('Book added successfully');
        done();
      });
  });
  test('Should return error message if book already exists for a user', (done) => {
    const newBook = {
      userId,
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then(() => {
        return request(app).post('/book-to-swap')
          .send(newBook)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            expect(res.status).toEqual(422);
            expect(res.body.message).toContain('Already exists as a');
            done();
          });
      });
  });
  test('Should return users books', (done) => {
    const newBook = {
      userId,
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then(() => {
        return request(app).get(`/user-books/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            done();
          });
      });
  });
  test('Should return empty array if no books are present for a user', done =>
    request(app).get(`/user-books/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.body).toEqual([]);
        done();
      }));
});
