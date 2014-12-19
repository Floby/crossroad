var http = require('http');

module.exports = Crossroad;

function Crossroad (options) {
  if(!(this instanceof Crossroad)) return new Crossroad(options);

  var self = this;
  options = options || {};
  this.port = options.port || 0;

  this.server = http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    var body = {
      crossroad: {
        version: '0.0.0',
        port: self.port
      }
    }
    res.end(JSON.stringify(body, null, '  '));
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
  this.server.close(callback);
}
