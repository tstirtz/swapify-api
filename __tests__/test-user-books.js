const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');
const { BookToSwap } = require('../user-books/book-swap-model');
const { Users } = require('../user/models');
const { Message } = require('../messages/message-model');


describe('/book-to-swap end point', () => {
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

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('should return a book', (done) => {
    console.log(userId);
    const newBook = {
      userId: 'testUser',
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    const expectedBook = {
      title: 'Enders Game',
      author: 'Orson Scott Card',
    };
    // const user = {
    //   username: 'testUser',
    //   _id: userId,
    // };
    // authToken = jwt.sign({ user }, JWT_SECRET, {
    //   subject: user.username,
    //   expiresIn: JWT_EXPIRY,
    //   algorithm: 'HS256',
    // });

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
    // const user = {
    //   username: 'testUser',
    //   _id: userId,
    // };
    // const authToken = jwt.sign({ user }, JWT_SECRET, {
    //   subject: user.username,
    //   expiresIn: JWT_EXPIRY,
    //   algorithm: 'HS256',
    // });
    return request(app).post('/book-to-swap')
      .send(newBook)
      .set('Authorization', `Bearer ${authToken}`)
      .then((first) => {
        console.log(first.body);
        return request(app).post('/book-to-swap')
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
  test('Should return users books', (done) => {
    console.log(userId);
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
  test('Should return empty array if no books are present for a user', (done) => {
    return request(app).get(`/user-books/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res.body).toEqual([]);
        done();
      });
  });
});


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
    console.log(authToken);
    console.log(userId);
    return request(app).post('/book-to-swap')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBook)
      .then(() => {
        BookToSwap.find({})
          .then((book) => {
            console.log(book);
            console.log(book[0]._id);
            return bookId = book[0]._id;
          })
          .then((id) => {
            return request(app).delete(`/${bookId}/delete-book`)
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
  test('Should return null if no book is found to delete', (done) => {
    const bookId = 'aaaaaaaaaaaaaaaaaaaaaaaa'
    return request(app).delete(`/${bookId}/delete-book`)
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        console.log(res.body);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({});
        done();
      });
  });
  test('Should return unauthorized if jwt is invalid', (done) => {
    let bookId;
    BookToSwap.find({})
      .then((book) => {
        console.log(book);
        console.log(book[0]._id);
        return bookId = book[0]._id;
      })
      .then((id) => {
        return request(app).delete(`/${bookId}/delete-book`)
          .set('Authorization', 'Bearer invalidToken')
          .then((res) => {
            // console.log(res);
            expect(res.status).toEqual(401);
            done();
          });
      });
  });
});


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

// describe('/send-message endpoint', () => {
//   let userId;
//   let authToken;
//
//   beforeAll(() => runServer(TEST_DATABASE_URL, 4000));
//   beforeEach(() => {
//     const user = {
//       first: 'Test',
//       last: 'Test',
//       email: 'test@test.com',
//       username: 'testUser',
//       password: 'anothertest',
//     };
//     return request(app).post('/sign-up')
//       .send(user)
//       .then((res) => {
//         Users.find({})
//           .then((foundUser) => {
//             console.log(foundUser[0]._id);
//             userId = foundUser[0]._id;
//             console.log(userId);
//             return foundUser;
//           });
//       });
//   });
//
//   beforeEach(() => {
//     const userCredentials = {
//       username: 'testUser',
//       password: 'anothertest',
//     }
//
//     return request(app).post('/login')
//       .send(userCredentials)
//       .then((response) => {
//         console.log(response.body);
//         authToken = response.body.jwt;
//         console.log(authToken);
//       });
//   });
//
//   afterEach(() => {
//     console.log('Deleting books');
//     return BookToSwap.deleteMany();
//   });
//   afterEach(() => {
//     console.log('Deleting users');
//     return Users.deleteMany();
//   });
//
//   afterEach(() => {
//     console.log('Deleting messages');
//     return Message.deleteMany();
//   });
//
//   afterAll(() => closeServer());
//
//   process.on('unhandledRejection', (reason) => {
//     console.error(reason);
//     process.exit(1);
//   });
//
//   it('Should create a new message', (done) => {
//     console.log(authToken);
//     const newMessage = {
//       to: 'user123',
//       from: 'testUser',
//       content: 'Hey there',
//       timeStamp: '5/22/2018',
//     }
//
//     return request(app).post('/send-message')
//       .send(newMessage)
//       .set('Authorization', `Bearer ${authToken}`)
//       .then((res) => {
//         expect(res.status).toEqual(200);
//         expect(res.body).toEqual({ message: 'Message sent' });
//         done();
//       });
//   });
//   it('Should return an error if a field is messing in request body', (done) => {
//     const messageWithMissingField = {
//       from: 'testUser',
//       content: 'Hey there',
//       timeStamp: '5/22/18',
//     };
//
//     return request(app).post('/send-message')
//       .send(messageWithMissingField)
//       .set('Authorization', `Bearer ${authToken}`)
//       .then((res) => {
//         expect(res.status).toEqual(420);
//         done();
//       });
//   });
// });
