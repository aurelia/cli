var expect = require('chai').expect;

describe('installer unit tests', () => {
  var sut;

  beforeEach(() => {
    sut = require('../src/lib/installer');
  });

  it('should reject with error msg if no tag information available', (done) => {
    sut.installTemplate('blusdlkjwer')
      .then((res) => {
        done();
      })
      .catch((msg) => {
        expect(msg).to.equal('Failed to get latest release info');
        done();
      });
  });

  it('should execute callback after installing jspm dependencies', () => {
    var injectr = require('injectr');

    sut = injectr('../src/lib/installer/index.js', {
      jspm: {
        configureLoader: (conf) => {
          return Promise.resolve(true);
        },
        dlLoader: (res) => {
          return Promise.resolve(true);
        },
        install: (opt) => {
          return {
            then: (cb) => cb()
          }
        }
      }
    });

    sut.runJSPMInstall(() => {
      expect(true).to.equal(true);
    });
  });
});
