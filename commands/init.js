var cli    = process.AURELIA;
var stream = require('vinyl-fs');
var exists = require('fs').existsSync;
var logger = cli.import('lib/logger');
var ask    = cli.import('lib/ask');
var api    = cli.api;
// INIT
//
// Executable Command that will initialize the directory, and add an AureliaFile if !exists
//
function Init() {
  logger.ok('initializing');
  exists(cli.env.configPath)
    ? prompt()
    .then(function(answers) {
      answers.overwrite
        ? api.init()
        : logger.ok('Aureliafile was not overwritten!');

    })
    : api.init();
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
