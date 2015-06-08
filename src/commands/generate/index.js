import * as logger from '../../lib/logger';
import * as generator from '../../lib/generator';
import {parseList} from '../../lib/utils';
import {command, option, description, arg} from 'aurelia-command';

@command('generate')
@arg('<type>')
@description('scaffold elements for your project')
@option('-n, --name <name>', "Name of the file / class")
@option('-v, --view', "Create a view for generated file type")
@option('-i, --inject <list>', "Name of dependency to inject", parseList)
@option('--no-lifecycle', "Do not create lifecycle callbacks, if applicable")
@option('-t, --template <name>', "Specify the name of the template to use as override")
export default class GenerateCommand {

  constructor(config, logger) {
    this.logger = logger;
    this.globalConfig = config;
    this.commandConfig = {};
  }

  action(argv, options) {
    if(argv.name) {
      logger.err('You must provide a name for the new element');
      return;
    }
    let cmd = argv.type;

    if(cmd.toLowerCase() === generator.templateType.vm) {
      var template = options.template || 'default'
        , inject   = options.inject;

      generator.createViewModel(options.name, template, inject).then( function(response) {
        if(options.view && options.view !== '') {
          generator.createView(options.name, template)
            .then(function(response) {})
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
