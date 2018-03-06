'use strict';
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const ConsoleUI = require('../../lib/ui').ConsoleUI;
const Runner = require('./release-checks/runner');
const LogManager = require('aurelia-logging');
const Logger = require('../../lib/logger').Logger;
const testSuites = require('./release-checks/test-suites');
const Utils = require('../../lib/build/utils');
const ui = new ConsoleUI();
const logger = LogManager.getLogger('Release-Check');

gulp.task('release-check', function(done) {
  const currentDir = process.cwd();
  LogManager.addAppender(new Logger(new ConsoleUI()));
  LogManager.setLevel('info');

  // ui.question('Which project directory contains all the projects to test?')
  // .then(dir => {
  //   if (!fs.existsSync(dir)) {
  //     throw new Error('The path does not exist');
  //   }
  const dir = '/home/jeroen/Development/Aurelia/Apps/testapps';

  matchTestSuites(dir)
  .then(suites => {
    Utils.runSequentially(
      suites,
      suite => {
        logger.info(`Executing ${suite.title}`);

        const context = {
          suite: suite,
          workingDirectory: path.join(dir, suite.title)
        };
        const runner = new Runner(context);

        return runner.run()
        .then(() => {
          process.chdir(currentDir);
          console.log('Finished test suite ' + suite.title);
        })
        .catch(e => {
          process.chdir(currentDir);
          console.log('failed to run test suite ' + suite.title);
          console.log(e);
          throw e;
        });
      })
    .then(steps => {
      console.log('Finished all test suites');
      done();
    });
  });

  // });
});

function matchTestSuites(dir) {
  // list all subdirectories in the provided directory
  // try and match the names of those directories to the title of a test suite
  const isDirectory = source => fs.lstatSync(source).isDirectory();
  const directories = fs.readdirSync(dir).map(name => path.join(dir, name)).filter(isDirectory);
  const suites = [];

  for (const directoryPath of directories) {
    const directoryName = path.basename(directoryPath);
    const suite = testSuites.find(x => x.title === directoryName);
    if (suite) {
      suites.push(suite);
    }
  }

  if (suites.length === 0) {
    throw new Error('Could not match the name of any subdirectory to a test suite');
  }

  let formatted = '';
  for (const match of suites) {
    formatted = `${formatted}\r\n - ${match.title}`;
  }

  return ui.question(`Found test suites for:\r\n\ ${formatted}\r\n\r\n Would you like to run these?`, [{
    displayName: 'go ahead'
  }, {
    displayName: 'stop'
  }])
  .then(answer => {
    if (answer === 'stop') {
      throw new Error('stopped');
    }

    return suites;
  });
}

// /home/jeroen/Development/Aurelia/Apps/testapps/skeleton-requirejs-esnext