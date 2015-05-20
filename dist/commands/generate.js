'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLogger = require('../lib/logger');

var logger = _interopRequireWildcard(_libLogger);

var _libGenerator = require('../lib/generator');

var generator = _interopRequireWildcard(_libGenerator);

var cli = process.AURELIA;

function Generate(cmd, options) {
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

module.exports = Generate;