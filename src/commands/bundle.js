import  bundle  from '../lib/bundler';

export default class BundleCommand {

  static register(command) {
    command('bundle')
      .alias('b')
      .description('Create a new bundle based on the configuration in Aureliafile.js')
      .option('-a --add <path>', "Add system.js path to files or file to bundle")
      .option('-r --remove <remove_path>', 'Remove file path or file from bundle')
      .option('-l, --list', 'List paths and files included in bundle');
  }

  constructor(program, config, logger) {
    this.program       = program;
    this.logger        = logger;
    this.globalConfig  = config;
    this.commandConfig = {};
  }

  action(){
    return bundle(this.commandConfig);
  }
}
