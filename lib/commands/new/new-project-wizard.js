"use strict"

exports.NewProjecWizard = class {
  constructor(ui) {
    this.ui = ui;
    this.configuration = {};
  }

  start(projectName) {
    this.ui.open();
    this.configuration = {
      name: projectName,
      transpiler: 'babel',
      cssProcessor: 'none',
      codeEditor: 'vscode',
      targetPlatform: 'web'
    };

    return this.ui.displayLogo().then(() => {
      if (projectName) {
        this.ui.write('New Aurelia Project: ' + projectName);
        return this.chooseCustomOrDefault().then(() => {
          this.ui.close();
          return this.configuration;
        });
      } else {
        this.ui.write('New Aurelia Project');
        return this.chooseName().then(() => {
          this.ui.close();
          return this.configuration;
        });
      }
    });
  }

  chooseName() {
    return this.ui.question(
      'What would you like to name your new project?'
    ).then(answer => {
      this.configuration.name = answer;
      return this.chooseCustomOrDefault();
    });
  }

  chooseCustomOrDefault() {
    return this.ui.question(
      'Would you like to use the default setup or customize your choices?',
      ['Default', 'Custom']
    ).then(answer => answer === 'default' ? this.defaultSetup() : this.customSetup());
  }

  defaultSetup() {
    return this.configuration;
  }

  customSetup() {
    return this.chooseTranspiler()
      .then(() => this.chooseCSSPreprocessor())
      .then(() => this.chooseCodeEditor())
      .then(() => this.choosePlatform());
  }

  chooseTranspiler() {
    return this.ui.question(
      'What transpiler would you like to use?',
      ['Babel', 'TypeSript']
    ).then(answer => {
      this.configuration.transpiler = answer;
      return this.configuration;
    });
  }

  chooseCSSPreprocessor() {
    return this.ui.question(
      'What css processor would you like to use?',
      ['None', 'LESS', 'SASS', 'Stylus']
    ).then(answer => {
      this.configuration.cssProcessor = answer;
      return this.configuration;
    });
  }

  chooseCodeEditor() {
    return this.ui.question(
      'What is your default code editor?',
      ['VSCode', 'Atom', 'Submlime', 'WebStorm', 'VisualStudio']
    ).then(answer => {
      this.configuration.codeEditor = answer;
      return this.configuration;
    });
  }

  choosePlatform() {
    return this.ui.question(
      'What platform are you targeting?',
      ['Web', 'MVC', 'PhoneGap', 'Electron']
    ).then(answer => {
      this.configuration.targetPlatform = answer;
      return this.configuration;
    });
  }
}
