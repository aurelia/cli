import * as logger from '../../lib/logger';
import * as generator from '../../lib/generator';
import {parseList} from '../../lib/utils';

export default class GenerateCommand {
  constructor(program, config, logger) {
    this.program = program;
    this.logger = logger;
    this.commandId = 'generate';
    this.globalConfig = config;
    this.commandConfig = {};

    program.command('generate <type>')
      .description('scaffold elements for your project')
      .option('-n, --name <name>', "Name of the file / class")
      .option('-v, --view', "Create a view for generated file type")
      .option('-i, --inject <list>', "Name of dependency to inject", parseList)
      .option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
      .option('-t, --template <name>', "Specify the name of the template to use as override")
      .action((cmd,  options) => {
        this.run(cmd, options);
      });
  }

  run(cmd, options) {
    if(typeof options.name === 'function' || options.name === '') {
      logger.err('You must provide a name for the new element');
      return;
    }

    if(cmd.toLowerCase() === generator.templateType.vm) {
      var template = options.template || 'default'
        , inject   = options.inject;

      generator.createViewModel(options.name, template, inject).then( function(response) {
        logger.log(response);

        if(options.view && options.view !== '') {
          generator.createView(options.name, template)
            .then(function(response) { logger.log(response); })
            .catch(function(response) { logger.log(response); });
        }
      }).catch(function(err) {
        logger.log(err);
      });
    } else if( cmd.toLowerCase() === generator.templateType.view ) {
      var template = options.template || 'default';

      generator.createView(options.name, template);
    }
  }
}
