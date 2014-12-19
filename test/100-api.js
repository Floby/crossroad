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

      describe('with a valid service description', function () {
        it('returns a 201', function (done) {
          postService(validDescriptor)
          .expect(201)
          .end(done)
        });
      })
    });
  });

  describe('GET /services/:type/:version-spec', function () {
    describe('when no service is registered', function () {
      it('returns a 404', function (done) {
        supertest()
          .get('/services/my-service/^1.1.0')
          .set('Accept', 'application/json')
          .expect(404)
          .expect({ status: 'not_found', reason: 'No service matches my-service@^1.1.0' })
          .end(done)
      });
    });

    describe('when a service is registered', function () {
      beforeEach(function (done) {
        supertest().post('/services')
                   .set('Content-Type', 'application/json')
                   .send(validDescriptor)
                   .expect(201)
                   .end(done)
      });

      describe('with a non matching version range', function () {
        it('returns a 200 with the service description', function (done) {
          supertest()
            .get('/services/my-service/^0.1.6')
            .expect(404)
            .expect('Content-Type', /application\/json/)
            .expect({ status: 'not_found', reason: 'No service matches my-service@^0.1.6' })
            .end(done)
        });
      });

      describe('with a matching version range', function () {
        it('returns a 200 with the service description', function (done) {
          supertest()
            .get('/services/my-service/~1.0.0')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect({
              type: 'my-service',
              version: '1.0.3',
              location: {
                hostname: '127.0.0.1',
                port: 877
              }
            })
            .end(done)
        });
      });
    })
  });
})

var validDescriptor = {
  type: 'my-service',
  version: '1.0.3',
  location: {
    hostname: '127.0.0.1',
    port: 877
  }
}
