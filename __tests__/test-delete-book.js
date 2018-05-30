const request = require('supertest');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');


describe('/:bookId/delete-book endpoint', () => {
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

  beforeEach(() => {
    const newBook = {
      userId: 'testUser',
      username: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };

    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        console.log(res.body);
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

  test('Should return deleted book object', (done) => {
    let bookId;
    const deletedBook = {
      userId: 'testUser',
      username: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };

    const newBook = {
      userId: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    return request(app).post('/book-to-swap')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBook)
      .then(() => {
        BookToSwap.find({})
          .then((book) => {
            return bookId = book[0]._id;
          })
          .then((id) => {
            return request(app).delete(`/${bookId}/delete-book`)
              .set('Authorization', `Bearer ${authToken}`)
              .then((res) => {
                expect(res.status).toEqual(200);
                expect(res.body).toEqual(deletedBook);
                done();
              });
          });
      });
  });
  test('Should return null if no book is found to delete', (done) => {
    const bookId = 'aaaaaaaaaaaaaaaaaaaaaaaa'
    return request(app).delete(`/${bookId}/delete-book`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({});
        done();
      });
  });
  test('Should return unauthorized if jwt is invalid', (done) => {
    let bookId;
    BookToSwap.find({})
      .then((book) => {
        return bookId = book[0]._id;
      })
      .then((id) => {
        return request(app).delete(`/${bookId}/delete-book`)
          .set('Authorization', 'Bearer invalidToken')
          .then((res) => {
            expect(res.status).toEqual(401);
            done();
          });
      });
  });
});
