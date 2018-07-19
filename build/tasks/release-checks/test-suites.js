'use strict';
const tasks = require('./tasks/index');
const tests = require('./tests/index');

const defaultAureliaCLIBundlerTests = [
  new tasks.ChangeDirectory(),
  new tasks.InstallNodeModules(),
  new tasks.InstallLatestAureliaCLI(),
  new tests.requirejs.AuRunDoesNotThrowCommandLineErrors(),
  new tests.requirejs.AuRunLaunchesServer(),
  new tests.requirejs.AuRunWatchPicksUpFileChanges(),
  new tests.requirejs.AuRunAppLaunchesWithoutJavascriptErrors(),
  new tests.requirejs.AuRunRendersPage(),
  new tests.requirejs.AuTestRunsTests(),
  new tests.requirejs.AuProtractorRunsTests(),
  new tests.requirejs.AuLintFinishes(),
  new tests.requirejs.AuJestRunsTests()
];

const defaultWebpackTests = [
  new tasks.ChangeDirectory(),
  new tasks.InstallNodeModules(),
  new tasks.InstallLatestAureliaCLI(),
  new tests.webpack.AuRunDoesNotThrowCommandLineErrors(),
  new tests.webpack.AuRunLaunchesServer(),
  new tests.webpack.AuRunRendersPage(),
  new tests.webpack.AuRunAppLaunchesWithoutJavascriptErrors(),
  new tests.webpack.AuRunWatchPicksUpFileChanges(),
  new tests.webpack.AuKarmaRunsTests(),
  new tests.webpack.AuJestRunsTests(),
  new tests.webpack.AuProtractorRunsTests()
];

const defaultAureliaCLIDotNetTests = [
  new tasks.ChangeDirectory(),
  new tasks.InstallNodeModules(),
  new tasks.InstallLatestAureliaCLI(),
  // todo: dotnet project should serve the index.html from wwwroot, not a view on the server
  // new tasks.DotNetNewWeb(),
  // new tests.requirejs.dotnet.DotNetRunDoesNotThrowCommandLineErrors(),
  // new tests.requirejs.dotnet.DotNetRunLaunchesServer(),
  // new tests.requirejs.dotnet.DotnetRunRendersPage(),
  // new tests.requirejs.dotnet.DotNetRunAppLaunchesWithoutJavascriptErrors(),
  // new tests.requirejs.AuProtractorRunsTestsDotNet(),
  new tests.requirejs.AuBuildDoesNotThrowCommandLineErrors(),
  new tests.requirejs.AuBuildWatchPicksUpFileChanges(),
  new tests.requirejs.AuTestRunsTests(),
  new tests.requirejs.AuLintFinishes(),
  new tests.requirejs.AuJestRunsTests()
];

module.exports = [
  {
    title: 'skeleton-requirejs-esnext',
    steps: defaultAureliaCLIBundlerTests
  },
  {
    title: 'skeleton-requirejs-typescript',
    steps: defaultAureliaCLIBundlerTests
  },
  {
    title: 'skeleton-systemjs-typescript',
    steps: defaultAureliaCLIBundlerTests
  },
  {
    title: 'skeleton-systemjs-esnext',
    steps: defaultAureliaCLIBundlerTests
  },
  {
    title: 'skeleton-webpack-esnext',
    steps: defaultWebpackTests
  },
  {
    title: 'skeleton-webpack-typescript',
    steps: defaultWebpackTests
  },
  {
    title: 'skeleton-requirejs-esnext-aspnetcore',
    steps: defaultAureliaCLIDotNetTests
  }
];
