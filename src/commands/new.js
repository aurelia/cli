import * as logger from '../lib/logger';
import { installTemplate } from '../lib/installer';
import {init} from '../lib/init';
import { map } from 'lodash';

let templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};

export default class NewCommand {

  static register(command) {
    command('new')
      .arg('[template]')
      .description('create a new Aurelia project')
      .beforeAction('prompt');
  }

  constructor(config, logger) {
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
    var app = answers.template || (agrv.template && templates[argv.template]);

    if (!app) {
      logger.error('Unknown template, please type aurelia new --help to get information on available types');
      return;
    }
    var self = this;
    return installTemplate(app)
      .then(function(response) {
        logger.ok(response.msg || response);
        return self.init();
      })
      .catch(function(err) {
        logger.error(err);
      });
  }

  init() {
    return init(this.globalConfig, {overwrite:true})
      .then(function(response){
        logger.ok(response.msg || response);
      });
  }
}
