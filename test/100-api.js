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

  describe('POST /services', function () {
    describe('when posting a JSON service manifest', function () {
      it('replies 400 when not giving a type', function (done) {
        supertest()
          .post('/services')
          .set('Content-Type', 'application/json')
          .send({})
          .expect(400)
          .expect(/body.type: missing/i)
          .end(done)
      });

      it('replies 400 when not giving a version', function (done) {
        supertest()
          .post('/services')
          .set('Content-Type', 'application/json')
          .send({type: 'my-service-type'})
          .expect(400)
          .expect(/body.version: missing/i)
          .end(done)
      });

      it('replies 400 when giving an invalid version format', function (done) {
        supertest()
          .post('/services')
          .set('Content-Type', 'application/json')
          .send({type: 'my-service-type', version: 'bidule chose'})
          .expect(400)
          .expect(/body.version: failed/i)
          .end(done)
      });
    });
  });
})
