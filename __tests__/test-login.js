const request = require('supertest');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { Users } = require('../user/models');

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
            userId = foundUser[0]._id;
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
        authToken = response.body.jwt;
      });
  });

  afterEach(() => {
    console.log('Deleting users');
    return Users.deleteMany();
  });

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('Should return JWT and user info on successfull login', (done) => {
    const user = {
      username: 'testUser',
      password: 'anothertest',
    };

    return request(app).post('/login')
      .send(user)
      .then((res) => {
        expect(res.body).toHaveProperty('jwt', 'id', 'user');
        done();
      });
  });

  test('Should return error for invalid username', (done) => {
    const invalidUser = {
      username: 'incorrectUsername',
      password: 'anothertest',
    };

    return request(app).post('/login')
      .send(invalidUser)
      .then((res) => {
        expect(res.status).toEqual(401);
        done();
      });
  });

  test('Should return error for invalid password', (done) => {
    const invalidUser = {
      username: 'testUser',
      password: 'incorrectPassword',
    };

    return request(app).post('/login')
      .send(invalidUser)
      .then((res) => {
        expect(res.status).toEqual(401);
        done();
      });
  });
});
