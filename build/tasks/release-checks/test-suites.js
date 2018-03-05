'use strict';
const tasks = require('./tasks/index');
const tests = require('./tests/index');

module.exports = [
  {
    title: 'skeleton-requirejs-esnext',
    steps: [
      new tasks.ChangeDirectory(),
      new tasks.InstallNodeModules(),
      new tests.requirejs.AuRunDoesNotThrowCommandLineErrors(),
      new tests.requirejs.AuRunLaunchesServer(),
      new tests.requirejs.AuRunAppLaunchesWithoutJavascriptErrors()
    ]
  }
];
