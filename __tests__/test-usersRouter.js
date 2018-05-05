const request = require('supertest');
const app = require('../app');
const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { Users } = require('../user/models');

describe('/sign-up end point', () => {
  beforeAll(() => runServer(TEST_DATABASE_URL, 4000));
  beforeEach(() => Users.remove({}).exec());
  afterAll(() => closeServer());

  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
  });
  it('Should return new user', () => {
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
    }

    return request(app).post('/sign-up')
      .send(user)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual(expectedUser);
      });
  });
  it('Should return error due to missing field', () => {
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
      });
  });

  it('Should return error for password with leading or trailing whitespace', () => {
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
      });
  });
  it('Should return error if password is too long', () => {
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
      });
  });
  it('Should return error if password is too short', () => {
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
      });
  });
  // it('Should return error if username is already taken', () => {
  //   const user = {
  //     firstName: 'Test',
  //     lastName: 'Test',
  //     email: 'test@test.com',
  //     username: 'test123',
  //     password: 'anothertest',
  //   };
  //
  //   return request(app).post('/sign-up')
  //     .send(user)
  //     .then(() =>
  //       request(app).post('/sign-up')
  //         .send(user)
  //         .then(res => expect(res.status).toEqual(422)))
  // });
});
