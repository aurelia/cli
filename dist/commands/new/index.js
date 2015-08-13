'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _libLogger = require('../../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInstaller = require('../../lib/installer');

var _lodash = require('lodash');

var _libAsk = require('../../lib/ask');

var _decorators = require('../../decorators');

var templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

var prompts = [{
  type: 'list',
  name: 'template',
  message: 'Template?',
  choices: (0, _lodash.map)(templates, function (temp, key) {
    return {
      name: key,
      value: temp
    };
  })
}];

var NewCommand = (function () {
  function NewCommand(config, logger) {
    _classCallCheck(this, _NewCommand);
  }

  var _NewCommand = NewCommand;

  _createClass(_NewCommand, [{
    key: 'action',
    value: function action(cmd, opt) {
      (0, _libAsk.ask)(prompts).then(function (answers) {
        var app = answers.template;

        if (!app) {
          logger.error('Unknown template, please type aurelia new --help to get information on available types');
          return;
        }

        (0, _libInstaller.installTemplate)(app).then(function (response) {
          logger.log(response);
        })['catch'](function (err) {
          logger.error(err);
        });
      });
    }
  }]);

  NewCommand = (0, _decorators.args)('[type]')(NewCommand) || NewCommand;
  NewCommand = (0, _decorators.command)('new')(NewCommand) || NewCommand;
  return NewCommand;
})();

exports['default'] = NewCommand;
module.exports = exports['default'];