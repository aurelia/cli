'use strict';
const AuRun = require('./requirejs/au-run');

module.exports = {
  requirejs: {
    AuRunDoesNotThrowCommandLineErrors: AuRun.AuRunDoesNotThrowCommandLineErrors,
    AuRunLaunchesServer: AuRun.AuRunLaunchesServer,
    AuRunAppLaunchesWithoutJavascriptErrors: AuRun.AuRunAppLaunchesWithoutJavascriptErrors
  }
};
