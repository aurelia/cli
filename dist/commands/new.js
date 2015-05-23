'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.action = action;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInstaller = require('../lib/installer');

var _lodash = require('lodash');

var cli = process.AURELIA;

var init = cli['import']('commands/init').action;

var templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

var prompts = [{
  type: 'list',
  name: 'template',
  message: 'Template?',
  choices: (0, _lodash.map)(templates, function (temp, key) {
    return { name: key, value: temp };
  })
}];

function action(cmd, options) {
  return cmd ? run(cmd.toLowerCase()) : this.ask(prompts).then(run);
}

function run(answers) {
  var app = answers.template;

  if (!app) {
    logger.error('Unknown template, please type aurelia new --help to get information on available types');
    return;
  }

  return (0, _libInstaller.installTemplate)(app).then(function (response) {
    logger.log(response);
    return init();
  }).then(function () {
    cli.done();
  })['catch'](function (err) {
    logger.error(err);
  });
}