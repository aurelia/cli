var cli = process.AURELIA;
var stream = require('vinyl-fs');
var exists = require('fs').existsSync;
var logger = cli.import('lib/logger');
var ask = cli.import('lib/ask');
// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
//
function Init() {
  logger.ok('initializing');
  var Aureliafile = process.cwd() + '/Aureliafile.js';
  exists(Aureliafile)
    ? prompt()
    .then(function(answers) {
      answers.overwrite
        ? createFile()
        : logger.ok('Aureliafile was not overwritten!');

    })
    : createFile();
};

function createFile() {
  return stream.src(cli.root('Aureliafile.js'))
    .pipe(stream.dest(process.cwd()))
    .on('error', function(err) {
      logger.err('Issue creating %s', 'AureliaFile'.green);
      console.log(err);
    })
    .on('end', function() {
      logger.ok('%s created', 'AureliaFile'.green);
    });
}

function prompt() {
  var prompts = [{
    type: 'confirm',
    name: 'overwrite',
    message: 'Aureliafile already exists!'.red + ' Would you like to overwrite?',
    default: false
  }];
  return ask(prompts);
}

module.exports = Init;
