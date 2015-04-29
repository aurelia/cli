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
});
