'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libLogger = require('../../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libInstaller = require('../../lib/installer');

var _libInit = require('../../lib/init');

var _lodash = require('lodash');

var templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

var NewCommand = (function () {
  function NewCommand(config, logger) {
    _classCallCheck(this, NewCommand);

    this.logger = logger;
    this.commandId = 'new';
    this.globalConfig = config;

    this.prompts = [{
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
  }

  _createClass(NewCommand, [{
    key: 'action',
    value: function action(argv, options, answers) {
      var app = answers.template || agrv.template && templates[argv.template];

      if (!app) {
        logger.error('Unknown template, please type aurelia new --help to get information on available types');
        return;
      }
      var self = this;
      return (0, _libInstaller.installTemplate)(app).then(function (response) {
        logger.log(response.msg || response);
        return (0, _libInit.init)(self.globalConfig, { overwrite: true });
      }).then(function (response) {
        logger.log(response.msg || response);
      })['catch'](function (err) {
        logger.error(err);
      });
    }
  }], [{
    key: 'register',
    value: function register(command) {
      command('new').arg('[template]').description('create a new Aurelia project').beforeAction('prompt');
    }
  }]);

  return NewCommand;
})();

exports['default'] = NewCommand;
module.exports = exports['default'];