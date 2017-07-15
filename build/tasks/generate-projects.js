require('aurelia-polyfills');
const gulp = require('gulp');
const Container = require('aurelia-dependency-injection').Container;
const definition = require('../../lib/commands/new/new-application.json');
const WorkflowEngine = require('../../lib/workflow/workflow-engine').WorkflowEngine;
const ProjectCreate = require('../../lib/workflow/activities/project-create');
const UI = require('../../lib/ui').UI;
const ConsoleUI = require('../../lib/ui').ConsoleUI;
const fs = require('fs');
const LogManager = require('aurelia-logging');
const Logger = require('../../lib/logger').Logger;

gulp.task('generate-projects', function(done) {
  LogManager.addAppender(new Logger(new ConsoleUI()));
  LogManager.setLevel('debug');

  const ui = new ConsoleUI();

  ui.question('Where would you like to create the projects?')
  .then(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    process.chdir(dir);

    return createProjectsInSeries(require('./skeletons.json'))
    .then(() => {
      console.log('Created all projects');
      done();
    })
    .catch(e => {
      console.log(e);
      done();
    });
  });
});

function createProjectsInSeries(instructions) {
  let i = -1;
  function createP() {
    i++;

    if (i < instructions.length) {
      return createProject(instructions[i]).then(createP);
    }

    return Promise.resolve();
  }

  return createP();
}

function createProject(answers) {
  let container = new Container();
  let engine = new WorkflowEngine(
    definition,
    container
  );

  container.registerInstance(UI, new ConsoleUI());
  container.unregister('project-install');
  container.registerInstance('project-install', new AutoProjectInstall());
  container.unregister('project-create');
  container.registerSingleton('project-create', AutoProjectCreate);
  container.unregister('input-text');
  container.registerInstance('input-text', new AutoInputText(answers));
  container.unregister('input-select');
  container.registerInstance('input-select', new AutoInputSelect(answers));
  container.unregister('input-multiselect');
  container.registerInstance('input-multiselect', new AutoInputMultiSelect(answers));

  return engine.start()
  .then(() => console.log('Finished creating project'))
  .catch(e => {
    console.log('error while creating project');
    console.log(e);
    throw e;
  });
}

class AutoInputSelect {
  constructor(answers) {
    this._answers = answers;
  }

  execute(context) {
    let answer = this._answers[this.id];

    if (!answer) {
      answer = this.options[0].value;
    }

    context.state[this.stateProperty] = answer;
    context.next(this.nextActivity);
  }
}

class AutoInputMultiSelect {
  constructor(answers) {
    this._answers = answers;
  }

  execute(context) {
    let answer = this._answers[this.id];

    if (!answer) {
      answer = [this.options[0].value];
    }

    context.state[this.stateProperty] = answer;
    context.next(this.nextActivity);
  }
}

class AutoInputText {
  constructor(answers) {
    this._answers = answers;
  }

  execute(context) {
    let answer = this._answers[this.id];

    if (!answer) {
      throw new Error('AutoInputText has no answer for activityId ' + this.id);
    }

    context.state[this.stateProperty] = answer;
    context.next(this.nextActivity);
  }
}

class AutoProjectCreate extends ProjectCreate {
  projectConfirmation() {
    return Promise.resolve({ value: 'yes' });
  }
}

class AutoProjectInstall {
  execute(context) {
    context.next(this.nextActivity);
  }
}
