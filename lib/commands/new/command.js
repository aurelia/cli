const fs = require('../../file-system');
const {CLIOptions} = require('../../cli-options');
const UI = require('../../ui').UI;
const logger = require('aurelia-logging').getLogger('new');
const selectFeatures = require('../../workflow/select-features');
const writeProject = require('../../workflow/write-project');
const applicable = require('../../workflow/applicable');
const {choosePackageManager, installDeps} = require('./install-deps');
const Configuration = require('../config/configuration');
const c = require('ansi-colors');
const _ = require('lodash');

module.exports = class {
  static inject() { return [UI, CLIOptions]; }

  constructor(ui, options) {
    this.ui = ui;
    this.options = options;
  }

  async execute(args) {
    // Create project in current cwd
    // --here
    // -h
    this.here = this.options.hasFlag('here');

    // Unattended mode
    // --unattended
    // -u
    this.unattended = this.options.hasFlag('unattended');

    // Preselect features
    // In unattended mode, these overwrite default-esnext selections.
    // In interactive mode, some questions will be skipped because they are
    // pre-answered.
    // --select cli-bundler,alameda,karma
    // -s cli-bundler,alameda,karma
    let selectedFeatures = (this.options.getFlagValue('select') || '').split(',');
    selectedFeatures = _(selectedFeatures).map(_.trim).map(_.toLower).compact().value();

    // Auto install npm packages.
    // This bypasses the question to choose package manager
    // --install-deps yarn
    // -i yarn
    // --install-deps npm
    // -i npm
    let packageManager = this.options.getFlagValue('install-deps');

    // TODO: Create aurelia plugin
    // --plugin
    // -p
    this.plugin = this.options.hasFlag('plugin');

    let projectName;
    if (this.here) {
      const dir = this.options.originalBaseDir;
      projectName = dir.split(/\\|\//).pop();
    } else if (args[0] && !args[0].startsWith('-')) {
      projectName = args[0];
    }

    await this.ui.displayLogo();

    projectName = await this.ensureProjectName(projectName);
    try {
      const confirm = await this.confirmToWriteOnExistingFolder(projectName);
      if (!confirm) return;
    } catch (e) {
      logger.error(e.message);
      process.exit(1);
      return;
    }

    const projectFolder = this.here ? '.' : projectName;

    const features = await selectFeatures(selectedFeatures, {
      unattended: this.unattended,
      plugin: this.plugin
    });
    await writeProject(projectName, features, projectFolder, this.unattended);
    await this.showSummary(projectName, features);
    await this.optionallyInstallDeps(packageManager, projectFolder);
    await this.displayCompletionMessage(projectName, features, projectFolder);
  }

  async ensureProjectName(name) {
    name = (name || '').trim();
    if (name) return name;
    if (this.unattended) return 'aurelia-app';

    return await this.ui.ensureAnswer(
      name,
      'Please enter a name for your new project:',
      'aurelia-app'
    );
  }

  async confirmToWriteOnExistingFolder(projectName) {
    let question;
    let yesHint;

    if (!this.here && fs.isFile(projectName)) {
      throw new Error(`There is an existing file named as ${projectName}, cannot create folder ${projectName}.`);
    } else if (!this.here && fs.isDirectory(projectName)) {
      if (this.unattended) {
        throw new Error(`The '${projectName}' folder already exists. Please make sure it's not there for unattended mode.`);
      }
      question = `WARNING: The '${projectName}' folder already exists. Would you like to create the project in this folder?`;
      yesHint = `Continue even though the '${projectName}' directory already exists.`;
    } else if (this.here && fs.readdirSync(process.cwd()).length > 0) {
      // Default answer is yes in unattended mode
      if (this.unattended) return true;
      question = 'WARNING: The current directory is not empty. Would you like to create the project in this folder?';
      yesHint = 'Continue even though the current directory is not empty.';
    }

    if (!question) return true;

    const confirm = await this.ui.question(
      c.red(question),
      [
        {value: 'abort', message: 'Abort', hint: 'Aborts the new project wizard.'},
        {value: 'continue', message: 'Continue', hint: c.red(yesHint)}
      ]
    );

    return confirm === 'continue';
  }

  async showSummary(projectName, features) {
    // Ensure to wrap projectName with quotes if there is white space in it.
    const wrappedName = projectName.match(/\s/) ? JSON.stringify(projectName) : projectName;
    const feats = await minFeatures(features, this.plugin);

    await this.ui.log('');
    await this.logTitle('Project Summary');
    await this.logBody(`This project was bootstrapped based on following selected features:
${c.green(features.join(' '))}
Next time, you can generate a new project faster in unattended mode with the same features:
${cmd(`au new ${wrappedName} --unattended${feats.length ? ' --select ' : ''}${feats.join(',')}${this.plugin ? ' --plugin' : ''}${this.here ? ' --here' : ''}`)}
Or use the shorter form:
${cmd(`au new ${wrappedName} -u${feats.length ? ' -s ' : ''}${feats.join(',')}${this.plugin ? ' -p' : ''}${this.here ? ' -h' : ''}`)}
Note the command might not supply all the selected features, as some features get installed by default, so those were omitted from the command.`);
  }

  async optionallyInstallDeps(packageManager, projectFolder) {
    await this.logTitle('Project Dependencies');
    if (packageManager || !this.unattended) {
      packageManager = await choosePackageManager(packageManager, projectFolder, this.ui);
      if (packageManager) {
        await this.logBody('Installing project dependencies...');
        await installDeps(packageManager, projectFolder);
        // Save to aurelia_project/aurelia.json
        const config = new Configuration({originalBaseDir: projectFolder});
        await config.execute('set', 'packageManager', packageManager);
        await config.save(false);
        await this.logBody('Project dependencies were installed.');
        return;
      }
    }

    await this.logBody('Dependencies were not installed.');

    if (this.unattended) {
      await this.logBody(`By default, unattended mode does not install project dependencies.
If you want to auto-install deps, add one more option to the command:
${cmd('--install-deps yarn')}, or ${cmd('--install-deps npm')}, or shorter form ${cmd('-i npm')}.`);
    }
  }

  async displayCompletionMessage(projectName, features, projectFolder) {
    let message = 'Now it\'s time to get started. It\'s easy.\n';

    let runCommand = 'au run';

    if (applicable(features, 'dotnet-core')) {
      runCommand = 'dotnet run';
    }

    runCommand = cmd(runCommand);

    if (this.here) {
      message += `Simply run your new app in dev mode with ${runCommand}.\n`;
    } else {
      message += `First, change directory into your new project's folder. You can use ${cmd(`cd ${projectName}`)} to get there.\n`;
      message += `If dependencies were not installed, use ${cmd('npm i')} or ${cmd('yarn')} to install dependencies first.\n`;
      message += `Then run your new app in dev mode with ${runCommand}.\n`;
    }

    message += `If you want to build your app for production, run ${cmd('au build --env prod')}.\n`;
    message += `If you need help, simply run ${cmd('au help')}.\n`;

    await this.logTitle('Congratulations!');
    await this.logBody(`Your Project "${projectName}" Has Been Created!`);
    await this.logTitle('Getting started');
    await this.logBody(message);
    await this.logTitle('Happy Coding!');
  }

  async logTitle(message) {
    await this.ui.log(c.bgGreen.black.bold(' ' + message + ' '));
  }

  async logBody(message) {
    await this.ui.log(message);
    await this.ui.log('');
  }
};

function cmd(str) {
  return c.inverse(' ' + str + ' ');
}

async function minFeatures(features, plugin) {
  const mustHave = [];
  for (let i = 0, ii = features.length; i < ii; i++) {
    const oneLess = [...features];
    oneLess.splice(i, 1);
    const result = await selectFeatures(oneLess, {unattended: true, plugin});
    if (!_.isEqual(result, features)) {
      mustHave.push(features[i]);
    }
  }
  return mustHave;
}

