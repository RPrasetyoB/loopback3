const app = require('../server');
const request = require('supertest');

function json(verb, url) {
  return request(app)[verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

describe('customer endpoint request', function() {
  let server;

  beforeAll(async () => {
  server = await require('./start-server').default;
  });


  afterAll(function(done) {
    app.removeAllListeners('started');
    app.removeAllListeners('loaded');
    done();
  });
  
  it('should register', function(done) {
    json('post', '/api/auth/register')
      .send({
        username: 'rpb5',
        password: 'abc123'
      })
      .expect(200, function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should login', function(done) {
    json('post', '/api/auth/login')
      .send({
        username: 'rpb',
        password: 'abc123'
      })
      .expect(200, function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should get user', function(done) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTcxMzMzODA5NiwiZXhwIjoxNzE4NTIyMDk2fQ.OozQQYavR4uWWROpftviA15wMmF-vKTmFX_veujA-0I";
  json('get', '/api/user')
    .set('Authorization', `Bearer ${token}`)
    .expect(200, function(err, res) {
      if (err) return done(err);
      done();
    });
  });

  it('should update user', function(done) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTcxMzMzOTkxMCwiZXhwIjoxNzE4NTIzOTEwfQ.spBf7bxgojeTACkjCF__F-3m4kKa402dddw_kg7n7ok";

  // Update username to 'rpb10'
  json('put', '/api/user')
    .set('Authorization', `Bearer ${token}`)
    .send({
      username: 'rpb10',
      password: 'abc123'
    })
    .expect(200, function(err, res) {
      if (err) return done(err);

      // Revert username back to 'rpb'
      json('put', '/api/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'rpb2',
          password: 'abc123'
        })
        .expect(200, function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  it('should delete user', function(done) {
  json('post', '/api/auth/login')
    .send({
      username: 'rpb5',
      password: 'abc123'
    })
    .end(function(err, loginRes) {
      if (err) return done(err);
      const token = loginRes.body.token;

      json('post', '/api/user/delete')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, function(err, deleteRes) {
          if (err) return done(err);
          done();
        });
    });
  });
});
