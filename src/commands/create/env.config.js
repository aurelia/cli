var Promise  = require('bluebird'),
    basename = require('path').basename,
    exists   = require('fs').existsSync;

var cli     = process.AURELIA,
    logger  = cli.import('lib/logger'),
    ask     = cli.import('lib/ask'),
    store   = cli.import('lib/store');

var CWD        = process.env.PWD,
    configName = '/.aurelia-config.json',
    isConfig,
    configPath,
    envOptions,
    config;

/**
 * configure                  Check is the config exists in CWD
 *                            if config exists, initialize the config store
 *                            otherwise, recursively check for the configfile
 * @param  {Object}  options  the command arguments object
 * @return {Promise} config   return a new promise that resolves the configfile options
 */
function configure(options){
    envOptions = options;
    isConfig = exists(CWD + configName);

    if (isConfig) {

        logger.log('[%s] [%s] [%s] ', 'Config'.blue, 'found'.green, CWD.cyan);
        return initConfig();

    } else {

        logger.log('[%s] [%s] [%s] ','Config'.blue, 'Not found'.red, CWD.red);
        return recursiveCheck();
    }
}

/**
 * initConfig                      with the passed configPath, check to see if the path exists, then run the prompts
 * @param  {String} pathToConfig   Directory path containing .aurelia-config.json
 * @return {Promise}               return the promise from runPrompt after running createConfig.
 */
function initConfig (pathToConfig){
    if (pathToConfig && pathToConfig !== CWD) {
        process.chdir(pathToConfig);
    }
    pathToConfig = process.cwd();
    configPath   = pathToConfig + configName;
    config       = isConfig ? require(configPath) : {};

    return runPrompt()
        .then(createConfig);
}

/**
 * runPrompt          Prompt for project name and project level
 * @return {Promise}  Promise object resolves with answers to prompt.
 */
function runPrompt(){
    config.paths = config.paths || {plugins: '', project:'', templates:''};
    var prompts = [{
        type: 'input',
        name: 'name',
        message: 'Project name?',
        default: envOptions.name || config.name || basename(CWD)
    },{
        type: 'list',
        name: 'level',
        message: 'Project Level',
        default: envOptions.level || config.level || 'advanced',
        choices: [
            {name: 'Simple', value:'simple'},
            {name: 'Advanced', value:'advanced'}
        ]
    },{
        type: 'input',
        name: 'projectPath',
        message: 'Project Path?',
        default: config.paths.project ? basename(config.paths.project) : 'project'
    },{
        type: 'input',
        name: 'pluginPath',
        message: 'Plugin Path?',
        default: config.paths.plugins ? basename(config.paths.plugins) : 'plugins'
    },{
        type: 'input',
        name: 'templatePath',
        message: 'Plugin Path?',
        default: config.paths.templates ? basename(config.paths.templates) : 'templates'
    }];
    return ask(prompts);
}
/**
 * createConfig     Resolves the answers from @runPrompt
 *                  creates and Initializes the cli store
 *                  sets the name, level, and rootDir on config
 *                  Saves the config
 * @param    {Object} answers  the answers from runPrompt
 * @calledBy runPrompt
 * @return   {Object} config returns created or reinitialize environment config.
 */
function createConfig(answers){
    CWD = process.cwd();
    cli.store = store.getInstance(CWD);
    cli.store.init();
    var configurations = {
        name : answers.name,
        level: answers.level,
    };
    cli.store.config.paths.project   = CWD + '/' + answers.projectPath;
    cli.store.config.paths.plugins   = CWD + '/' + answers.pluginPath;
    cli.store.config.paths.templates = CWD + '/' + answers.templatePath;
    cli.store.save(configurations);
    logger.ok('Finished creating Env');
    return cli.store.config;
}

/**
 * recursiveCheck            Recursively backup through directories looking for the .aurelia-config.json
 *                           If config is found, use the found configPath, otherwise, use CWD
 * @return {Promise}         returns the promise form initConfig
 */
function recursiveCheck(){
    var pathSplit = CWD.split('/');
    var tempPath;
    while ( !exists(pathSplit.join('/') + configName) && pathSplit.length ) {
        pathSplit.pop();
    }

    tempPath   = pathSplit.join('/');
    isConfig   = exists(tempPath + configName);
    if (isConfig) {
        logger.log('[%s] [%s] [%s] ', 'Config'.blue, 'found'.green, tempPath.cyan);

        return initConfig(tempPath);
    } else {
        logger.log('[%s] [%s] between [%s] and [%s]','Config'.blue, 'Not found'.red, '~/'.red, CWD.red);
        return initConfig();
    }
}

module.exports = configure;
