import * as logger from '../../lib/logger';
import { installTemplate } from '../../lib/installer';
import { map } from 'lodash';
import { ask } from '../../lib/ask';

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

export default class NewCommand {
  constructor(program, config, logger) {
    this.program = program;
    this.logger = logger;
    this.commandId = 'new';
    this.globalConfig = config;

    program.command('new [type]')
      .description('create a new Aurelia project')
      .action((opt) => {
        this.run(opt);
      })
      .on('--help', function() {
        example('new', {
          navigation: {
            flags: 'navigation',
            info: 'create a new skeleton navigation style app',
            required: true
          },
          plugin: {
            flags: 'plugin',
            info: 'create a new aurelia plugin template',
            required: true
          }
        });
      });
  }


  run(opt) {
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
