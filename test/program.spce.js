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
});
