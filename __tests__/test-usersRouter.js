const request = require('supertest');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { Users } = require('../user/models');

describe('/sign-up end point', () => {
  beforeAll(() => runServer(TEST_DATABASE_URL, 4000));

  afterEach(() => {
    console.log('Deleting db');
    return Users.deleteMany();
  });

  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });

  test('Should return new user', (done) => {
    const user = {
      first: 'Test',
      last: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: 'anothertest',
    };
    const expectedUser = {
      name: {
        first: 'Test',
        last: 'Test',
      },
      email: 'test@test.com',
      username: 'test123',
    };

    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual(expectedUser);
        done();
      });
  });
  test('Should return error due to missing field', (done) => {
    const user = {
      last: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: 'anothertest',
    };

    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(422);
        done();
      });
  });

  test('Should return error for password with leading or trailing whitespace', (done) => {
    const user = {
      first: 'Test',
      last: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: ' anothertest ',
    };
    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(422);
        expect(res.body.message).toContain('Cannot start or end with whitespace');
        done();
      });
  });

  test('Should return error if password is too long', (done) => {
    let tooLargePassword = '';
    for (let i = 0; i < 73; i += 1) {
      tooLargePassword += 't';
    }
    const user = {
      first: 'Test',
      last: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: tooLargePassword,
    };
    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(422);
        expect(res.body.message).toContain('Password must not be more than 72 characterslong');
        done();
      });
  });
  test('Should return error if password is too short', (done) => {
    const user = {
      first: 'Test',
      last: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: 'test',
    };
    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(422);
        expect(res.body.message).toContain('Password must be at least 10 characters long');
        done();
      });
  });
  test('Should return error if username is already taken', (done) => {
    const user = {
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@test.com',
      username: 'test123',
      password: 'anothertest',
    };

    return request(app).post('/sign-up')
      .send(user)
      .then(() =>
        request(app).post('/sign-up')
          .send(user)
          .then((res) => {
            expect(res.status).toEqual(422);
            done();
          }));
  });
});
