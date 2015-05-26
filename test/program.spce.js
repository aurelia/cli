var expect = require('chai').expect;

describe('installer unit tests', () => {
  var sut, argv, aurelia, command, cmd;

  sut = {
      aurelia: {}
    , program: {}
  };

  argv = {
    init: {_:['init'], two:true}
  };

  beforeEach(() => {
    sut.aurelia = require('../src/');

    sut.aurelia.init({
      argv: argv.init
    });

    sut.program = sut.aurelia.program;

    cmd     = argv.init._[0];
    command = sut.aurelia.commands[cmd];
  });

  it('Should contain the correct command', (done) => {
    expect(command.commandId).to.equal(cmd);
    done();
  });

  it('Should emit the correct events', (done) => {
    sut.program.on(cmd, function(){
      expect(command.commandId).to.equal(cmd);
      done();
    });
    sut.aurelia.run(argv.init);
  });

  describe('Command', function() {
    it('Should have a commandId', function(done) {
      expect(command.commandId).to.equal(cmd);
      done();
    });
  });
});
