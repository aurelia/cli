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
  new tests.requirejs.AuProtractorRunsTests(),
  new tests.requirejs.AuLintFinishes()
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
  new tests.requirejs.AuLintFinishes()
];

module.exports = [
  {
    title: 'skeleton-requirejs-esnext',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-requirejs-esnext-karma',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuTestRunsTests()
    ])
  },
  {
    title: 'skeleton-requirejs-typescript',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-requirejs-typescript-karma',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuTestRunsTests()
    ])
  },
  {
    title: 'skeleton-systemjs-typescript',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-systemjs-typescript-karma',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuTestRunsTests()
    ])
  },
  {
    title: 'skeleton-systemjs-esnext',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-systemjs-esnext-karma',
    steps: defaultAureliaCLIBundlerTests.concat([
      new tests.requirejs.AuTestRunsTests()
    ])
  },
  {
    title: 'skeleton-webpack-esnext',
    steps: defaultWebpackTests.concat([
      new tests.webpack.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-webpack-esnext-karma',
    steps: defaultWebpackTests.concat([
      new tests.webpack.AuKarmaRunsTests()
    ])
  },
  {
    title: 'skeleton-webpack-typescript',
    steps: defaultWebpackTests.concat([
      new tests.webpack.AuJestRunsTests()
    ])
  },
  {
    title: 'skeleton-webpack-typescript-karma',
    steps: defaultWebpackTests.concat([
      new tests.webpack.AuKarmaRunsTests()
    ])
  },
  {
    title: 'skeleton-requirejs-esnext-aspnetcore',
    steps: defaultAureliaCLIDotNetTests.concat([
      new tests.requirejs.AuJestRunsTests()
    ])
  }
];
