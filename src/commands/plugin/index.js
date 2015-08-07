import * as logger from '../../lib/logger';
import * as installer from '../../lib/installer';
import { map } from 'lodash';
import { ask } from '../../lib/ask';
import {command, args, alias, option, description} from '../../decorators';

@command('plugin')
@args('[p]')
@option('-l, --list', "List all installed plugins")
@description('install an aurelia plugin from the registry')
export default class PluginCommand {
  constructor(config, logger) {
  }

  action(cmd, options) {
    let prompts;

    installer.getPluginListPrompt().then(result => {
      var mapped = map(result, function(temp, key) {
        return {
          name: key,
          value: temp
        };
      });

      prompts = [{
        type: 'list',
        name: 'plugin',
        message: 'Which plugin do you want to install?',
        choices: mapped
      }];

      ask(prompts)
        .then((answers) => {
          var plugin = answers.plugin;

          if (!plugin) {
            logger.error('Unknown template, please type aurelia new --help to get information on available types');
            return;
          }

          installer.getPluginInfo(plugin).then( (info) => {
            if(info === null) {
              logger.error('No plugin found with the given name');
              return;
            }

            installer.installPlugin(info.name, info.endpoint, info.location).then( (result) => {
              console.log(result);
            });
          });

          /*installTemplate(app)
           .then(function(response) {
           logger.log(response);
           })
           .catch(function(err) {
           logger.error(err);
           });*/
        });
    });




  }
}
