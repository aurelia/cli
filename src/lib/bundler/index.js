import { bundleJS } from './js-bundler';
import { bundleTemplate } from './template-bundler';

// before calling any jspm api we should call the function bellow to set custom package path.
// jspm.setPackagePath('.');
// do we want to set custom set package path or baseURL? need discussion with @EisenbergEffect

export default function bundle(config, bundleOpts) {
  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(function(key) {
      var cfg = jsConfig[key];
      var outfile = key + '.js';
      var moduleExpr = cfg.modules.join(' + ');
      var opt = cfg.options;
      bundleJS(moduleExpr, outfile, opt, bundleOpts);
    });

  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(function(key) {
      var cfg = templateConfig[key];
      var outfileName = key + '.html';
      var pattern = cfg.pattern;
      var options = cfg.options;
      bundleTemplate(pattern, outfileName, options, bundleOpts);
    });
}
