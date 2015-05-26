import {init} from '../lib/init';

export default class InitCommand {

  static register(command){
    command('init')
      .option('-e, --env', 'Initialize an aurelia project environment')
      .description('Initialize a new Aurelia Project and creates an Aureliafile')
      .beforeAction('prompt');
  }

  constructor(config, logger) {
    this.logger       = logger;
    this.globalConfig = config;
  }

  prompt(ask, argv, options){
    var self = this;
    var prompts = [{
        type: 'confirm'
      , name: 'overwrite'
      , message: 'ConfigFile Exists! Overwrite?'
      , default: false
      , when: function() {
          return self.globalConfig.store.isConfig;
        }
    },{
        type: 'confirm'
      , name: 'sure'
      , message: 'Continue?'
      , default: true
      , when: function(answers) {
          return answers.overwrite;
        }
    }];
    return ask(prompts)
      .then(function(answers){
        answers.overwrite = answers.overwrite || false;
        return answers;
      });
  }

  action(argv, opts, answers){
    return init(this.globalConfig, answers)
      .then(function(responce){
        if (responce.msg)
          console.log(responce.msg);
      });
  }
}
