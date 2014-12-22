var crdt = require('crdt');
var stream = require('stream');

var semver = require('semver');

module.exports = Registry

function Registry () {
  if(!(this instanceof Registry)) return new Registry();
  this.add = add;
  this.find = find;
  this.syncWith = syncWith;
  this.createStream = createStream;

  var self = this;

  var services = new crdt.Doc();

  function add (service) {
    var row = services.add(service);
    return function () {
      services.rm(row.id)
    }
  }

  function find (type, range) {
    var set = services.createSet('type', type);
    var found = null;
    set.forEach(function (s) {
      if (semver.satisfies(s.state.version, range)) {
        found = ['type', 'version', 'location'].reduce(function (service, key) {
          service[key] = s.state[key];
          return service;
        }, {})
      }
    });
    return found;
  }

  function syncWith (stream) {
    stream.pipe(createStream()).pipe(stream);
  }

  function createStream () {
    return services.createStream();
  }
}

