import * as logger from '../lib/logger';
import {installTemplate} from '../lib/installer';
import {map} from 'lodash';

let cli = process.AURELIA;

let init = cli.import('commands/init').action;

let templates = {
    navigation :'skeleton-navigation'
  , plugin     :'skeleton-plugin'
};

// New
//
// Executable command for creating and downloading new Aurelia projects.
export function action(argv, options, answers) {
  var app = (argv.type && templates[argv.type]) || answers.template;
  if(!app) {
    logger.error('Unknown template, please type aurelia new --help to get information on available types');
    return;
  }

  return installTemplate(app)
    .then(function(response) {
      logger.log(response);
      return cli.store.init();
    })
    .then(function(){
      cli.done();
    })
    .catch(function(err) {
      logger.error(err);
    });
}

export function prompt(ask) {
  var self = this;
  let prompts = [{
      type: 'list'
    , name: 'template'
    , message: 'Template?'
    , choices: map(templates, function(temp, key){return {name:key, value:temp};})
    , when: function() {
      return !self.argv.type;
    }
  }];

  return ask(prompts);
}
