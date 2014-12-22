var expect = require('chai').expect;

var Registry = require('../lib/registry');

describe('a registry instance', function () {
  beforeEach(function () {
    registry = new Registry();
  });
  it('can be constructed withtout new', function () {
    var registry = Registry();
    expect(registry).to.be.an.instanceof(Registry);
  });

  describe('.find(type, range)', function () {
    it('is a function', function () {
      expect(registry).to.have.property('find');
      expect(registry.find).to.be.a('function');
    });

    it('returns null when no services are registered', function () {
      expect(registry.find('bidule', '2.3')).to.equal(null);
    })
  });

  describe('.add(service)', function () {
    var service;
    beforeEach(function () {
      service = {
        type: 'some-type',
        version: '3.2.1',
        location: {}
      }
    })
    it('is a function', function () {
      expect(registry).to.have.property('add');
      expect(registry.add).to.be.a('function');
    });

    it('does not throw', function () {
      registry.add(service);
    })

    describe('then .find(type, range)', function () {
      beforeEach(function () {
        registry.add(service);
      });

      describe('with a non matching version range', function () {
        it('returns null', function () {
          expect(registry.find('some-type', '1.x.x')).to.equal(null);
        });
      });

      describe('with a matching version range', function () {
        it('returns the service', function () {
          expect(registry.find('some-type', '3.x.x')).to.deep.equal({
            type: 'some-type',
            version: '3.2.1',
            location: {}
          });
        });
      });
    });

    it('returns a function', function () {
      expect(registry.add(service)).to.be.a('function');
    });

    describe('the returned function', function () {
      var remover;
      beforeEach(function () {
        remover = registry.add(service);
      });
      it('removes the service from the registry', function () {
        remover();
        expect(registry.find('some-type', '3.x.x')).to.equal(null);
      });
    })
  })

  describe('.createStream()', function () {
    it('returns a duplex stream', function () {
      var str = registry.createStream();
      expect(str.readable).to.equal(true);
      expect(str.writable).to.equal(true);
    });
  });

  describe('.syncWith(duplexStream)', function () {
    var service = {
      type: 'my-service-type',
      version: '1.2.3',
      location: {}
    }
    it('synchronizes two registries', function (done) {
      var reg1 = Registry();
      var reg2 = Registry();
      reg1.syncWith(reg2.createStream());

      var remover = reg1.add(service);
      setTimeout(function () {
        expect(reg2.find('my-service-type', '^1.2.0')).to.deep.equal({
          type: 'my-service-type',
          version: '1.2.3',
          location: {}
        });

        remover();
        setTimeout(function () {
          expect(reg2.find('my-service-type', '1.2.3')).to.equal(null);
          done();
        }, 2)
      }, 2)
    });
  });
});

