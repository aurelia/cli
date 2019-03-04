const tasks = require('./tasks/index');
const tests = require('./tests/index');
const applicable = require('../../../lib/workflow/applicable');

module.exports = function(suite) {
  const features = suite.split('_');
  const ext = applicable(features, 'typescript') ? '.ts' : '.js';

  const steps = [
    new tasks.ChangeDirectory(),
    new tasks.InstallNodeModules(),
    new tasks.InstallLatestAureliaCLI(),
    new tests.generic.AuGenerateAttributeTests(ext),
    new tests.generic.AuGenerateComponentTests(ext),
    new tests.generic.AuGenerateElementTests(ext),
    new tests.generic.AuGenerateValueConverterTests(ext),
    new tests.generic.AuGenerateBindingBehaviorTests(ext),
    new tests.generic.AuGenerateTaskTests(ext),
    new tests.generic.AuGenerateGeneratorTests(ext)
  ];


  if (applicable(features, 'jest')) {
    steps.push(
      new tests.generic.AuJestRunsTests()
    );
  }

  if (applicable(features, 'karma')) {
    steps.push(
      new tests.generic.AuKarmaRunsTests()
    );
  }

  if (applicable(features, 'protractor')) {
    steps.push(
      new tests.generic.AuProtractorRunsTests()
    );
  }

  if (applicable(features, 'cypress')) {
    steps.push(
      new tests.generic.AuCypressRunsTests()
    );
  }

  if (applicable(features, 'cli-bundler')) {
    steps.push(
      new tests.requirejs.AuBuildDoesNotThrowCommandLineErrors(),
      new tests.requirejs.AuBuildWatchPicksUpFileChanges(),
      new tests.requirejs.AuRunDoesNotThrowCommandLineErrors(),
      new tests.requirejs.AuRunLaunchesServer(),
      new tests.requirejs.AuRunWatchPicksUpFileChanges(),
      new tests.requirejs.AuRunAppLaunchesWithoutJavascriptErrors(),
      new tests.requirejs.AuRunRendersPage(),
      new tests.generic.AuLintFinishes()
    );
  }

  if (applicable(features, 'webpack')) {
    steps.push(
      new tests.webpack.AuRunDoesNotThrowCommandLineErrors(),
      new tests.webpack.AuRunLaunchesServer(),
      new tests.webpack.AuRunRendersPage(),
      new tests.webpack.AuRunAppLaunchesWithoutJavascriptErrors(),
      new tests.webpack.AuRunWatchPicksUpFileChanges()
    );
  }

  // if (applicable(features, 'dotnet-core')) {
  //   steps.push(
  //     // todo: dotnet project should serve the index.html from wwwroot, not a view on the server
  //     new tasks.DotNetNewWeb(),
  //     new tests.generic.dotnet.DotNetRunDoesNotThrowCommandLineErrors(),
  //     new tests.generic.dotnet.DotNetRunLaunchesServer(),
  //     new tests.generic.dotnet.DotnetRunRendersPage(),
  //     new tests.generic.dotnet.DotNetRunAppLaunchesWithoutJavascriptErrors(),
  //     new tests.generic.AuProtractorRunsTestsDotNet()
  //   );
  // }

  return steps;
};
