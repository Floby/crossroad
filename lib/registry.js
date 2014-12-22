var semver = require('semver');

module.exports = Registry

function Registry () {
  if(!(this instanceof Registry)) return new Registry();
  this.add = add;
  this.find = find;

  var services = {};

  function add (service) {
    services[service.type] = service;
    return function () {
      delete services[service.type];
    }
  }

  function find (type, range) {
    if(!services[type]) return null;
    if(!semver.satisfies(services[type].version, range)) return null;
    return services[type];
  }
}

