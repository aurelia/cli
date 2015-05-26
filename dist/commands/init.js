'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libInit = require('../lib/init');

var InitCommand = (function () {
  function InitCommand(config, logger) {
    _classCallCheck(this, InitCommand);

    this.logger = logger;
    this.globalConfig = config;
    this.prompts = [{
      type: 'confirm',
      name: 'overwrite',
      message: 'ConfigFile Exists! Overwrite?',
      'default': false,
      when: (function () {
        return this.globalConfig.store.isConfig;
      }).bind(this)
    }, {
      type: 'confirm',
      name: 'sure',
      message: 'Continue?',
      'default': true,
      when: function when(answers) {
        return answers.overwrite;
      }
    }];
  }

  _createClass(InitCommand, [{
    key: 'action',
    value: function action(argv, opts, answers) {
      answers.overwrite = answers.overwrite || false;
      return (0, _libInit.init)(this.globalConfig, answers).then(function (responce) {
        if (responce.msg) console.log(responce.msg);
      });
    }
  }], [{
    key: 'register',
    value: function register(command) {
      command('init').option('-e, --env', 'Initialize an aurelia project environment').description('Initialize a new Aurelia Project and creates an Aureliafile').beforeAction('prompt');
    }
  }]);

  return InitCommand;
})();

exports['default'] = InitCommand;
module.exports = exports['default'];