const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const deleteBookRouter =require('../user-books/delete-book-router');


let userId;
let authToken;
beforeAll(() => {
  return runServer(TEST_DATABASE_URL, 4000);
});
beforeAll(() => {
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

describe('/book-to-swap end point', () => {
  // let userId;
  // let authToken;
  // beforeAll(() => {
  //   return runServer(TEST_DATABASE_URL, 4000);
  // });
  // beforeAll(() => {
  //   const user = {
  //     first: 'Test',
  //     last: 'Test',
  //     email: 'test@test.com',
  //     username: 'testUser',
  //     password: 'anothertest',
  //   };
  //   return request(app).post('/sign-up')
  //     .send(user)
  //     .then((res) => {
  //       Users.find({})
  //         .then((foundUser) => {
  //           console.log(foundUser[0]._id);
  //           userId = foundUser[0]._id;
  //           console.log(userId);
  //         })
  //     });
  // });
  // afterEach(() => {
  //   console.log('Deleting db');
  //   return BookToSwap.deleteMany();
  // })
  // afterAll(() => {
  //   return closeServer();
  // });
  //
  // process.on('unhandledRejection', (reason) => {
  //   console.error(reason);
  //   process.exit(1);
  // });
  it('should return a book', (done) => {
    console.log(userId);
    const newBook = {
      userId: 'Test123',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const expectedBook = {
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const user = {
      username: 'test123',
      _id: userId,
    };
    authToken = jwt.sign({ user }, JWT_SECRET, {
      subject: user.username,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });

    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body).toContain('Book added successfully');
        done();
      });
  });
  it('Should return error message if book already exists for a user', (done) => {
    const newBook = {
      userId,
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const user = {
      username: 'test123',
      _id: userId,
    };
    // const authToken = jwt.sign({ user }, JWT_SECRET, {
    //   subject: user.username,
    //   expiresIn: JWT_EXPIRY,
    //   algorithm: 'HS256',
    // });
    request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((first) => {
        console.log(first.body);
        request(app).post('/book-to-swap')
          .send(newBook)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            console.log(res.body);
            expect(res.status).toEqual(422);
            expect(res.body.message).toContain('Already exists as a');
            done();
          });
      });
  });
  it('Should return users books', (done) => {
    console.log(userId);
    const newBook = {
      userId,
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then(() => {
        request(app).get(`/user-books/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            done();
          });
      });
  });
  it('Should return empty array if no books are present for a user', (done) => {
    request(app).get(`/user-books/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.body).toEqual([]);
        done();
      });
  });
});

describe.only('/:bookId/delete-book endpoint', () => {
  beforeEach(() => {
    const newBook = {
      userId: 'Test123',
      username: 'test123',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const user = {
      username: 'test123',
      _id: userId,
    };
    authToken = jwt.sign({ user }, JWT_SECRET, {
      subject: user.username,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });
    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        console.log(res.body);
      });
  })
  it('Should return deleted book object', (done) => {
    let bookId;
    const deletedBook = {
      userId: 'Test123',
      username: 'test123',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    BookToSwap.find({})
      .then((book) => {
        console.log(book);
        console.log(book[0]._id);
        return bookId = book[0]._id;
      })
      .then((id) => {
        request(app).delete(`/${bookId}/delete-book`)
          .set('Authorization', `Bearer ${authToken}`)
          .then((res) => {
            // console.log(res);
            expect(res.status).toEqual(200);
            expect(res.body).toEqual(deletedBook);
            done();
          });
      });
  });
});
