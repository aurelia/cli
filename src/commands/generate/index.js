import {command, option, args, description} from 'aurelia-command';
import * as logger from '../../lib/logger';
import * as generator from '../../lib/generator';
import {parseList} from '../../lib/utils';

@command('generate')
@args('[type]')
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

  action(args, options) {
    let cmd = args.type;
    if(typeof options.name === 'function' || options.name === '') {
      logger.err('You must provide a name for the new element');
      return;
    }

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
