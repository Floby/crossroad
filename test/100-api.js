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
    function postService (service) {
      return supertest()
        .post('/services')
        .set('Content-Type', 'application/json')
        .send(service)
    }
    describe('when posting a JSON service manifest', function () {
      describe('not including a type', function () {
        it('replies 400', function (done) {
          postService({})
            .expect(400)
            .expect(/body.type: missing/i)
            .end(done)
        });
      })
      describe('not including a version', function () {
        it('replies 400', function (done) {
          postService({type: 'my-service-type'})
            .expect(400)
            .expect(/body.version: missing/i)
            .end(done)
        });
      })
      describe('with an invalid version format', function () {
        it('replies 400', function (done) {
          postService({type: 'my-service-type', version: 'bidule chose'})
            .expect(400)
            .expect(/body.version: failed/i)
            .end(done)
        });
      })
    });
  });
})
