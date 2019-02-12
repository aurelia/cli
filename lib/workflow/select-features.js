const _ = require('lodash');
const runQuestionnaire = require('./run-questionnaire');
const {
  askBundler,
  askLoader,
  askHttp,
  askPlatform,
  askTranspiler,
  askMarkupProcessor,
  askCssProcessor,
  askPostCss,
  askUnitTestRunner,
  askIntegrationTestRunner,
  askEditor,
  askScaffold,
  askPluginScaffold
} = require('./questionnaire');

// Select features
// @param preselectedFeatures Optional preselected features, they can overwrite recommended features.
// @param opts Optional options, support two boolean options: unattended, plugin.
//
// Preselected features provided answer to some questions of the questionnaire,
// when it's answered, that questions will be skipped.
//
// In unattended mode, all questions without an answer (from features) will get the
// default answer (note: default answer is not always same as recommended feature).
//
// _debug is used to pass in answers for prompts.
module.exports = async function(preselectedFeatures = [], opts = {}, _debug = []) {
  const workflow = await selectWorkFlow({
    // If user preselected some features, don't ask them to choose work flow.
    unattended: opts.unattended || !!preselectedFeatures.length,
    plugin: opts.plugin
  }, _debug);
  const {flow, recommendedFeatures, unattended} = workflow;
  const flowUnattended = opts.unattended || unattended;

  // Allow user to overwrite recommended features.
  // Conflicting features will be cleaned up by appFlow/pluginFlow questionnaire.
  let features = [...(recommendedFeatures || []), ...preselectedFeatures];

  if (flow === 'app') {
    features = await appFlow(features, flowUnattended, _debug);
  } else if (flow === 'plugin') {
    // Plugin skeleton is only based on cli-bundler.
    // Don't allow user to overwrite cli-bundler with webpack
    _.pull(features, 'webpack');
    features = await pluginFlow(features, flowUnattended, _debug);
  } else {
    throw new Error(`Workflow "${flow}" is not recognizable.`);
  }

  return features;
};

// Recommended features are for default workflow choices, you only need to
// add a feature to this list if it's not the default answer of a question.
// For example, unit testing default answer is none (no unit testing), but
// we recommend user to have jest in all our default work flow choices.
const PRESETS = {
  'default-esnext': {flow: 'app', recommendedFeatures: ['jest', 'vscode'], unattended: true},
  'default-typescript': {flow: 'app', recommendedFeatures: ['jest', 'typescript', 'vscode'], unattended: true},
  'custom-app': {flow: 'app'},
  'default-plugin-esnext': {flow: 'plugin', recommendedFeatures: ['cli-bundler', 'requirejs', 'jest', 'vscode'], unattended: true},
  'default-plugin-typescript': {flow: 'plugin', recommendedFeatures: ['cli-bundler', 'requirejs', 'jest', 'typescript', 'vscode'], unattended: true},
  'custom-plugin': {flow: 'plugin', recommendedFeatures: ['cli-bundler', 'requirejs']}
};

async function selectWorkFlow(opts, _debug) {
  let workflow;

  if (opts.unattended) {
    // in unattended mode, auto pick the default workflow for app/plugin
    workflow = opts.plugin ? 'custom-plugin' : 'custom-app';
  } else {
    const ans = await runQuestionnaire([], [{
      message: 'Would you like to use the default setup or customize your choices?',
      choices: [{
        value: 'default-esnext',
        message: 'Default ESNext App',
        hint: 'A basic app with Babel and Webpack.'
      }, {
        value: 'default-typescript',
        message: 'Default TypeScript App',
        hint: 'A basic app with TypeScript and Webpack.'
      }, {
        value: 'custom-app',
        message: 'Custom App',
        hint: 'Select bundler, loader, transpiler, CSS pre-processor and more.'
      }
      /* TODO enable plugin flow after providing the plugin skeleton
      {
        role: 'separator'
      }, {
        value: 'default-plugin-esnext',
        message: 'Default ESNext Aurelia Plugin',
        hint: 'A basic Aurelia plugin with Babel'
      }, {
        value: 'default-plugin-typescript',
        message: 'Default TypeScript Aurelia Plugin',
        hint: 'A basic Aurelia plugin with TypeScript'
      }, {
        value: 'custom-plugin',
        message: 'Custom Aurelia Plugin',
        hint: 'Select transpiler, CSS pre-processor and more.'
      } */
      ]
    }], false, _debug);

    workflow = ans[0];
  }

  return PRESETS[workflow];
}

async function appFlow(features, unattended, _debug) {
  return await runQuestionnaire(features, [
    askBundler,
    askLoader,
    askHttp,
    askPlatform,
    askTranspiler,
    askMarkupProcessor,
    askCssProcessor,
    askPostCss,
    askUnitTestRunner,
    askIntegrationTestRunner,
    askEditor,
    askScaffold
  ], unattended, _debug);
}

async function pluginFlow(features, unattended, _debug) {
  return await runQuestionnaire(features, [
    askTranspiler,
    askMarkupProcessor,
    askCssProcessor,
    askPostCss,
    askUnitTestRunner,
    askEditor,
    askPluginScaffold
  ], unattended, _debug);
}
