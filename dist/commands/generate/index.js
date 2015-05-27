'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libLogger = require('../../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libGenerator = require('../../lib/generator');

var generator = _interopRequireWildcard(_libGenerator);

var _libUtils = require('../../lib/utils');

var GenerateCommand = (function () {
  function GenerateCommand(program, config, logger) {
    var _this = this;

    _classCallCheck(this, GenerateCommand);

    this.program = program;
    this.logger = logger;
    this.commandId = 'generate';
    this.globalConfig = config;
    this.commandConfig = {};

    program.command('generate <type>').description('scaffold elements for your project').option('-n, --name <name>', 'Name of the file / class').option('-v, --view', 'Create a view for generated file type').option('-i, --inject <list>', 'Name of dependency to inject', _libUtils.parseList).option('--no-lifecycle', 'Do not create lifecycle callbacks, if applicable').option('-t, --template <name>', 'Specify the name of the template to use as override').action(function (cmd, options) {
      _this.run(cmd, options);
    });
  }

  _createClass(GenerateCommand, [{
    key: 'run',
    value: function run(cmd, options) {
      if (typeof options.name === 'function' || options.name === '') {
        logger.err('You must provide a name for the new element');
        return;
      }

      if (cmd.toLowerCase() === generator.templateType.vm) {
        var template = options.template || 'default',
            inject = options.inject;

        generator.createViewModel(options.name, template, inject).then(function (response) {
          logger.log(response);

          if (options.view && options.view !== '') {
            generator.createView(options.name, template).then(function (response) {
              logger.log(response);
            })['catch'](function (response) {
              logger.log(response);
            });
          }
        })['catch'](function (err) {
          logger.log(err);
        });
      } else if (cmd.toLowerCase() === generator.templateType.view) {
        var template = options.template || 'default';

        generator.createView(options.name, template);
      }
    }
  }]);

  return GenerateCommand;
})();

exports['default'] = GenerateCommand;
module.exports = exports['default'];