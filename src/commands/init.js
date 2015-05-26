import {init} from '../lib/init';

export default class InitCommand {

  static register(command){
    command('init')
      .alias('i')
      .option('-e, --env', 'Initialize an aurelia project environment')
      .description('Initialize a new Aurelia Project and creates an Aureliafile')
      .beforeAction('prompt');
  }

  constructor(config, logger) {
    this.logger       = logger;
    this.globalConfig = config;
    this.prompts = [{
        type: 'confirm'
      , name: 'overwrite'
      , message: 'ConfigFile Exists! Overwrite?'
      , default: false
      , when: function() {
          return this.globalConfig.store.isConfig;
        }.bind(this)
    },{
        type: 'confirm'
      , name: 'sure'
      , message: 'Continue?'
      , default: true
      , when: function(answers) {
          return answers.overwrite;
        }
    }];
  }

  action(argv, opts, answers){
    answers.overwrite = answers.overwrite || false;
    return init(this.globalConfig, answers)
      .then(function(responce){
        if (responce.msg)
          console.log(responce.msg);
      });
  }
}
