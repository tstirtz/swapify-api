const request = require('supertest');
const app = require('../app');

describe('/sign-up end point', () => {
  it('Should return new user', () => {
    const user = {
      firstName: 'Test',
      lastName: 'Test',
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
      lastName: 'Test',
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
});
