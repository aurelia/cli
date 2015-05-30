import * as logger from '../../lib/logger';
import { installTemplate } from '../../lib/installer';
import { map } from 'lodash';
import { ask } from '../../lib/ask';
import {command, description, arg} from 'aurelia-command';

let templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

let prompts = [{
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

@command('new')
@arg('[type]')
@description('create a new Aurelia project')
export default class NewCommand {

  constructor(config, logger) {
    this.logger = logger;
    this.globalConfig = config;
  }

  action(argv, options) {
    ask(prompts)
      .then((answers) => {
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
      });
  }
}
