import {command, option, alias, description} from 'aurelia-command';
import bundle from '../../lib/bundler';

@command('bundle')
@alias('b')
@description('Create a new bundle based on the configuration in Aureliafile.js')
@option('-a --add <path>', "Add system.js path to files or file to bundle")
@option('-r --remove <remove_path>', 'Remove file path or file from bundle')
@option('-l, --list', 'List paths and files included in bundle')
export default class BundleCommand {
  constructor(config, logger) {
    this.logger = logger;
    this.globalConfig = config;
    this.commandConfig = {};
  }

  action(args, options){
    bundle(this.commandConfig);
  }
}
