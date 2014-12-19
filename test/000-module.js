var expect = require('chai').expect
var supertest = require('supertest');

describe('crossroad', function () {
  it('is requirable', function () {
    require('../index');
  })
  it('is a constructor', function () {
    var Crossroad = require('../index');
    var server = Crossroad();
    expect(server).to.be.an.instanceof(Crossroad);
  });

  describe('instance', function () {
    var Crossroad = require('../index')
    it('can start and stop an http server', function (done) {
      var crossroad = new Crossroad({ port: 5555 });
      crossroad.start(function (err) {
        if(err) return done(err);
        expect(crossroad.port).to.equal(5555);
        supertest('http://localhost:5555')
          .get('/')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect({
            crossroad: {
              version: '0.0.0',
              port: 5555,
            }
          })
          .end(function (err) {
            if(err) return done(err);
            crossroad.stop(done);
          })
      });
    })
  })
})
