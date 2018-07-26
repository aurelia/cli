'use strict';
const gulp = require('gulp');
const path = require('path');
const SuiteRunner = require('./release-checks/suite-runner');
const LogManager = require('aurelia-logging');
const Utils = require('../../lib/build/utils');
const ConsoleUI = require('../../lib/ui').ConsoleUI;
const MessageHistoryLogger = require('./release-checks/message-history-logger').MessageHistoryLogger;
const MatchingTestSuiteSelector = require('./release-checks/matching-test-suite-selector');
const Reporter = require('./release-checks/reporter');
const del = require('del');

let ui = new ConsoleUI();
let logger;
let msgHistoryLogger;
let originalDir = process.cwd();
let resultOutputFolder = path.join(originalDir, 'release-checks-results');

gulp.task('empty-release-checks-results-folder', (done) => {
  return del([
    resultOutputFolder + '/**/*'
  ]);
});

gulp.task('release-check', gulp.series(
  'empty-release-checks-results-folder',
  function(done) {
    configureLogging();

    const reporter = new Reporter();
    const selector = new MatchingTestSuiteSelector();

    return selector.execute()
    .then(suites => {
      return Utils.runSequentially(
        suites,
        suite => {
          logger.info(`Executing ${suite.title}`);

          const context = {
            suite: suite,
            resultOutputFolder: path.join(resultOutputFolder, suite.title),
            workingDirectory: suite.dir
          };
          const suiteRunner = new SuiteRunner(context, reporter);

          return suiteRunner.run()
          .then(steps => {
            return writeLog(context.resultOutputFolder, 'log-full.txt')
            .then(() => steps);
          })
          .catch(e => {
            logger.error(e);
            throw e;
          });
        }
      )
      .then(testSuitesResults => {
        if (testSuitesResults.length > 1) {
          console.log('---------------------------');
          console.log('---------------------------');
          console.log('--------SUMMARY-----------');
          console.log('---------------------------');
          console.log('---------------------------');

          for (const result of testSuitesResults) {
            reporter.logSummary(result.suite, result.steps);
          }
        }

        return writeLog(resultOutputFolder, 'summary.txt');
      });
    });
  })
);

function writeLog(dir, name) {
  const filePath = path.join(dir, name);
  return msgHistoryLogger.writeToDisk(filePath)
  .then(() => msgHistoryLogger.clearHistory());
}

function configureLogging() {
  msgHistoryLogger = new MessageHistoryLogger(ui);
  LogManager.addAppender(msgHistoryLogger);
  LogManager.setLevel('debug');
  logger = LogManager.getLogger('Release-Check');
}
