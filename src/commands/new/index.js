import * as logger from '../../lib/logger';
import { installTemplate } from '../../lib/installer';
import { map } from 'lodash';
import { ask } from '../../lib/ask';

let templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

export default class NewCommand {

  static register(command) {
    command('new [type]')
      .description('create a new Aurelia project')
      .prompt('onLoad');
  }

  constructor(program, config, logger) {
    this.program = program;
    this.logger = logger;
    this.commandId = 'new';
    this.globalConfig = config;

    this.prompts = [{
        type: 'list',
        name: 'template',
        message: 'Template?',
        choices: map(templates, function(temp, key) {
          return {
            name: key,
            value: temp
          };
        })
      }];
  }

  action(argv, options, answers) {
    var app = answers.template;

    if (!app) {
      logger.error('Unknown template, please type aurelia new --help to get information on available types');
      return;
    }

    installTemplate(app)
      .then(function(response) {
        logger.log(response);
      })
      .catch(function(err) {
        logger.error(err);
      });
  }
}
