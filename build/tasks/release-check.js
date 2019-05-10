const gulp = require('gulp');
const path = require('path');
const SuiteRunner = require('./release-checks/suite-runner');
const LogManager = require('aurelia-logging');
const Utils = require('../../lib/build/utils');
const {MessageHistoryLogger} = require('./release-checks/message-history-logger');
const TestProjectsSelector = require('./release-checks/test-projects-selector');
const Reporter = require('./release-checks/reporter');
const del = require('del');
const ConsoleUI = require('../../lib/ui').ConsoleUI;
const ui = new ConsoleUI();
const c = require('ansi-colors');

let logger;
let msgHistoryLogger;
let originalDir = process.cwd();
let resultOutputFolder = path.join(originalDir, 'release-checks-results');

gulp.task('empty-release-checks-results-folder', () => {
  return del([
    resultOutputFolder + '/**/*'
  ]);
});

gulp.task('release-check', gulp.series(
  'empty-release-checks-results-folder',
  async function() {
    configureLogging();

    const reporter = new Reporter();
    const selector = new TestProjectsSelector();

    const {testDir, dirs} = await selector.execute();
    const testSuitesResults = await Utils.runSequentially(
      dirs,
      async(dir, i) => {
        logger.info(c.inverse(`Executing ${i + 1}/${dirs.length} ${dir}`));

        const context = {
          suite: dir,
          resultOutputFolder: path.join(resultOutputFolder, dir),
          workingDirectory: path.join(testDir, dir)
        };
        const suiteRunner = new SuiteRunner(context, reporter);

        try {
          const result = await suiteRunner.run();
          await writeLog(context.resultOutputFolder, 'log-full.txt');
          return result;
        } catch (e) {
          logger.error(e);
          throw e;
        }
      }
    );

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

    await writeLog(resultOutputFolder, 'summary.txt');
  }
));

async function writeLog(dir, name) {
  const filePath = path.join(dir, name);
  await msgHistoryLogger.writeToDisk(filePath);
  await msgHistoryLogger.clearHistory();
}

function configureLogging() {
  msgHistoryLogger = new MessageHistoryLogger(ui);
  LogManager.addAppender(msgHistoryLogger);
  LogManager.setLevel('debug');
  logger = LogManager.getLogger('Release-Check');
}
