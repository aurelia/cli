import * as logger from '../lib/logger';
import {installTemplate} from '../lib/installer';
import {map} from 'lodash';

let cli = process.AURELIA;

let init = cli.import('commands/init').action;

let templates = {
    navigation :'skeleton-navigation'
  , plugin     :'skeleton-plugin'
};

let prompts = [{
    type: 'list'
  , name: 'template'
  , message: 'Template?'
  , choices: map(templates, function(temp, key){return {name:key, value:temp};})
}];

// New
//
// Executable command for creating and downloading new Aurelia projects.
export function action(cmd, options) {
  return cmd
    ? run(cmd.toLowerCase())
    : this.ask(prompts).then(run);
}

function run(answers) {
  var app = answers.template;

  if(!app) {
    logger.error('Unknown template, please type aurelia new --help to get information on available types');
    return;
  }

  return installTemplate(app)
    .then(function(response) {
      logger.log(response);
      return init();
    })
    .then(function(){
      cli.done();
    })
    .catch(function(err) {
      logger.error(err);
    });
}
