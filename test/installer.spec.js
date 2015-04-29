/* General unit tests */
describe('installer unit tests', function() {
  var sut;

  beforeEach(function() {
    sut = require('../lib/installer');
  });

  it('should console error on unknown repo', function(done) {
    console.error = createSpy('error');

    sut.installTemplate('blusdlkjwer');

    setTimeout( function() {
      expect(console.error).toHaveBeenCalledWith('Failed to get latest release info');
      done();
    }, 2000);
  });

  it('should execute callback after installing jspm dependencies', function() {
    var injectr = require('injectr');

    sut = injectr('../lib/installer.js', {
      jspm: {
        install: function(opt) {
          return {
            then: function(cb) {
              cb();
            }
          }
        }
      }
    });

    sut.runJSPMInstall(function() {
      expect(true).toBe(true);
    });
  });
});
