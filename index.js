var util = require('util');
var semver = require('semver');
var bodyParser = require('body-parser');
var paperwork = require('paperwork');
var express = require('express');
var http = require('http');
var EventEmitter = require('events').EventEmitter
var version = require('./package').version;
var Registry = require('./lib/registry');

module.exports = Crossroad;

util.inherits(Crossroad, EventEmitter);

function Crossroad (options) {
  if(!(this instanceof Crossroad)) return new Crossroad(options);

  EventEmitter.call(this);
  var self = this;
  self.registry = new Registry();
  options = options || {};
  this.port = options.port || 0;
  this.server = http.createServer(createApp(this))
}

var newServiceTemplate = {
  type: String,
  version: paperwork.all(String, semver.valid),
  location: Object
};

function createApp (server) {
  var app = express();
  app.disable('x-powered-by');
  app.use(function (res, res, next) {
    res.setHeader('Server', 'crossroad-v'+version);
    next();
  });
  app.get('/', sendInfo(server));
  app.get('/info', sendInfo(server));
  app.post('/services', 
      bodyParser.json(),
      paperwork.accept(newServiceTemplate),
      postService(server.registry, server))
  
  app.get('/services/:service_type/:version_spec',
      findService(server.registry),
      serviceNoMatch)

  return app;
}

function findService (registry) {
  return function (req, res, next) {
    var type = req.param('service_type');
    var spec = req.param('version_spec');
    var service = registry.find(type, spec);
    if(!service) return next();
    res.json(service);
  };
}

function postService (registry, server) {
  return function (req, res, next) {
    var service = req.body;
    var removeService = registry.add(service);
    res.setHeader('Connection', 'close');
    res.status(201).write(' ');
    server.once('_close', clearOnClose);
    res.on('close', function() {
      removeService();
    });
    function clearOnClose () {
      res.end();
    }
  }
}

function sendInfo (server) {
  return function (req, res) {
    res.json({
      crossroad: {
        version: version,
        port: server.port
      }
    })
  }
}

function serviceNoMatch (req, res) {
  res.status(404).json({
    status: 'not_found',
    reason: util.format('No service matches %s@%s', 
      req.param('service_type'), 
      req.param('version_spec'))
  })
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
  this.emit('_close');
  this.server.close(callback);
}
