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

var _lodash = require('lodash');

var _libAsk = require('../../lib/ask');

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
  function NewCommand(program, config, logger) {
    var _this = this;

    _classCallCheck(this, NewCommand);

    this.program = program;
    this.logger = logger;
    this.commandId = 'new';
    this.globalConfig = config;

    program.command('new [type]').description('create a new Aurelia project').action(function (opt) {
      _this.run(opt);
    }).on('--help', function () {
      example('new', {
        navigation: {
          flags: 'navigation',
          info: 'create a new skeleton navigation style app',
          required: true
        },
        plugin: {
          flags: 'plugin',
          info: 'create a new aurelia plugin template',
          required: true
        }
      });
    });
  }

  _createClass(NewCommand, [{
    key: 'run',
    value: function run(opt) {
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

  return NewCommand;
})();

exports['default'] = NewCommand;
module.exports = exports['default'];