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

var installer = _interopRequireWildcard(_libInstaller);

var _lodash = require('lodash');

var _libAsk = require('../../lib/ask');

var _decorators = require('../../decorators');

var PluginCommand = (function () {
  function PluginCommand(config, logger) {
    _classCallCheck(this, _PluginCommand);
  }

  var _PluginCommand = PluginCommand;

  _createClass(_PluginCommand, [{
    key: 'action',
    value: function action(cmd, options) {
      var prompts = undefined;

      installer.getPluginListPrompt().then(function (result) {
        var mapped = (0, _lodash.map)(result, function (temp, key) {
          return {
            name: key,
            value: temp
          };
        });

        prompts = [{
          type: 'list',
          name: 'plugin',
          message: 'Which plugin do you want to install?',
          choices: mapped
        }];

        (0, _libAsk.ask)(prompts).then(function (answers) {
          var plugin = answers.plugin;

          if (!plugin) {
            logger.error('Unknown template, please type aurelia new --help to get information on available types');
            return;
          }

          installer.getPluginInfo(plugin).then(function (info) {
            if (info === null) {
              logger.error('No plugin found with the given name');
              return;
            }

            installer.installPlugin(info.name, info.endpoint, info.location).then(function (result) {
              console.log(result);
            });
          });

          /*installTemplate(app)
           .then(function(response) {
           logger.log(response);
           })
           .catch(function(err) {
           logger.error(err);
           });*/
        });
      });
    }
  }]);

  PluginCommand = (0, _decorators.description)('install an aurelia plugin from the registry')(PluginCommand) || PluginCommand;
  PluginCommand = (0, _decorators.option)('-l, --list', 'List all installed plugins')(PluginCommand) || PluginCommand;
  PluginCommand = (0, _decorators.args)('[p]')(PluginCommand) || PluginCommand;
  PluginCommand = (0, _decorators.command)('plugin')(PluginCommand) || PluginCommand;
  return PluginCommand;
})();

exports['default'] = PluginCommand;
module.exports = exports['default'];