const app = require('../server');
const request = require('supertest');

function json(verb, url) {
  return request(app)[verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

describe('order endpoint request', function() {
  let server;

  beforeAll(async () => {
  server = await require('./start-server').default;
  });


  afterAll(function(done) {
    app.removeAllListeners('started');
    app.removeAllListeners('loaded');
    done();
  });

  it('should create order then delete order', function(done) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTcxMzQxNjk3OSwiZXhwIjoxNzE4NjAwOTc5fQ.v5FjERr0735i-pc39r8s8jZExV0tyzsc-Anckyykvr8";

  json('post', '/api/order')
    .set('Authorization', `Bearer ${token}`)
    .send({
        "menuItemId": [1,2],
        "quantity": [2,4]
    })
    .expect(200, function(err, res) {
      if (err) return done(err);
        const id = res.body.data.id
        json('delete', `/api/order/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200, function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  it("should get customer's order", function(done) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTcxMzMzODA5NiwiZXhwIjoxNzE4NTIyMDk2fQ.OozQQYavR4uWWROpftviA15wMmF-vKTmFX_veujA-0I";
  json('get', '/api/order')
    .set('Authorization', `Bearer ${token}`)
    .expect(200, function(err, res) {
      if (err) return done(err);
      done();
    });
  });

  it('should update order', function(done) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTcxMzM0MTYxOSwiZXhwIjoxNzE4NTI1NjE5fQ.CLO0_RhDWRmxX3H0eSF_kb8qLPDVbPoX2CF_1BAtRQg";

  json('put', '/api/order/10')
    .set('Authorization', `Bearer ${token}`)
    .send({
        "menuItemId": [1,2],
        "quantity": [2,4]
    })
    .expect(200, function(err, res) {
      if (err) return done(err);
      done();
    });
  });
});
