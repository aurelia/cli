import * as logger from '../lib/logger';
import { installTemplate } from '../lib/installer';
import {init} from '../lib/init';
import { map } from 'lodash';

let cmd;
let templates = {
  navigation: 'skeleton-navigation',
  plugin: 'skeleton-plugin'
};
let prompts = [{
    type    : 'list'
  , name    : 'template'
  , message : 'Template?'
  , when    : function() {return !cmd.argv.template;}
  , choices : map(templates, function(temp, key) {
      return {name: key, value: temp};
    })
}];

export default class NewCommand {

  static register(command) {
    command('new')
      .arg('[template]')
      .description('create a new Aurelia project')
      .prompt(prompts)
      .beforeAction('prompt');
  }

  constructor(config, logger) {
    var self = this;
    this.logger = logger;
    this.commandId = 'new';
    this.globalConfig = config;
    cmd = this;
  }

  action(argv, options, answers) {
    var app = answers.template || (argv.template && templates[argv.template]);

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
