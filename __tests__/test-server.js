const request = require('supertest');
const app = require('../app');

describe("Root endpoint '/'", ()=>{
    // before(()=>{
    //
    // });
    test('It should provide response to GET request', ()=>{
        return request(app).get('/')
            .then(res =>{
                expect(res.status).toEqual(200);
                expect(res.text).toEqual('Hello World!');
            });
    });
});
