var Crossroad = require('../index');

describe('a running instance', function () {
  var crossroad, supertest;
  beforeEach(function (done) {
    crossroad = new Crossroad({ port: 0 });
    crossroad.start(function (err) {
      if(err) return done(err);
      supertest = function (prefix) {
        prefix = prefix || 'http://localhost:'+crossroad.port;
        return require('supertest')(prefix);
      }
      done();
    })
  });

  afterEach(function (done) {
    crossroad.stop(done);
  });

  describe('GET /info', function () {
    it('returns some info about the state of the instance', function (done) {
      supertest()
        .get('/info')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect({
          crossroad: {
            version: '0.0.0',
            port: crossroad.port
          }
        })
        .end(done)
    });
  })
})
