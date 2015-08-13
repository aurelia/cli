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

var _libGenerator = require('../../lib/generator');

var generator = _interopRequireWildcard(_libGenerator);

var _libUtils = require('../../lib/utils');

var _decorators = require('../../decorators');

var GenerateCommand = (function () {
  function GenerateCommand(config, logger) {
    _classCallCheck(this, _GenerateCommand);
  }

  var _GenerateCommand = GenerateCommand;

  _createClass(_GenerateCommand, [{
    key: 'action',
    value: function action(cmd, options) {
      if (typeof options.name === 'function' || options.name === '') {
        logger.err('You must provide a name for the new element');
        return;
      }

      if (cmd.toLowerCase() === generator.templateType.vm) {
        var template = options.template || 'default',
            inject = options.inject;

        generator.createViewModel(options.name, template, inject).then(function (response) {
          if (options.view && options.view !== '') {
            generator.createView(options.name, template).then(function (response) {})['catch'](function (response) {
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

  GenerateCommand = (0, _decorators.description)('scaffold elements for your project')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.option)('-t, --template <name>', 'Specify the name of the template to use as override')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.option)('--no-lifecycle', 'Do not create lifecycle callbacks, if applicable')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.option)('-i, --inject <list>', 'Name of dependency to inject', _libUtils.parseList)(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.option)('-v, --view', 'Create a view for generated file type')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.option)('-n, --name <name>', 'Name of the file / class')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.args)('<type>')(GenerateCommand) || GenerateCommand;
  GenerateCommand = (0, _decorators.command)('generate')(GenerateCommand) || GenerateCommand;
  return GenerateCommand;
})();

exports['default'] = GenerateCommand;
module.exports = exports['default'];