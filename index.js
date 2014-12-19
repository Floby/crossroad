var semver = require('semver');
var bodyParser = require('body-parser');
var paperwork = require('paperwork');
var express = require('express');
var http = require('http');

module.exports = Crossroad;

function Crossroad (options) {
  if(!(this instanceof Crossroad)) return new Crossroad(options);

  var self = this;
  options = options || {};
  this.port = options.port || 0;
  this.server = http.createServer(createApp(this))
}

var newServiceTemplate = {
  type: String,
  version: paperwork.all(String, semver.valid)
};

function createApp (server) {
  var app = express();
  app.get('/', sendInfo(server));
  app.get('/info', sendInfo(server));
  app.post('/services', 
      bodyParser.json(),
      paperwork.accept(newServiceTemplate));

  return app;
}

function sendInfo (server) {
  return function (req, res) {
    res.json({
      crossroad: {
        version: '0.0.0',
        port: server.port
      }
    })
  }
}

var m = Crossroad.prototype;

m.start = function start (callback) {
  var self = this;
  this.server.listen(this.port, function (err) {
    self.port = self.server.address().port;
    callback(err);
  });
}

m.stop = function stop(callback) {
  this.server.close(callback);
}
