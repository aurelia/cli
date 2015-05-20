'use strict';

var cli = process.AURELIA,
    logger = cli['import']('lib/logger');
;

function Generate(cmd, options) {
  if (typeof options.name === 'function' || options.name === '') {
    logger.err('You must provide a name for the new element');
    return;
  }

  var generator = cli['import']('lib/generator');

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