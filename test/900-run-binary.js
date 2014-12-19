var spawn = require('child_process').spawn
var path = require('path');
var supertest = require('supertest');

describe('The crossroadd binary', function () {
  var child;
  beforeEach(function (done) {
    child = spawn(path.join(__dirname, '../bin/crossroadd'), ['--port', '5656'])
    setTimeout(done, 100)
  });
  afterEach(function () {
    child.kill()
    child.on('exit', function () {
      done();
    })
  });
  it('should start a server', function (done) {
    supertest('http://localhost:5656')
      .get('/')
      .expect(200)
      .end(done)
  });
});

