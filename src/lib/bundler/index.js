import { bundleJS } from './js-bundler';
import { bundleTemplate } from './template-bundler';

// before calling any jspm api we should call the function bellow to set custom package path.
// jspm.setPackagePath('.');
// do we want to set custom set package path or baseURL? need discussion with @EisenbergEffect

export default function bundle(config, bundleOpts) {
  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(key  => {
      let cfg = jsConfig[key];
      let outfile = key + '.js';
      let opt = cfg.options;
      bundleJS(cfg.modules, outfile, opt, bundleOpts);
    });

  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(key  => {
      let cfg = templateConfig[key];
      let outfile = key + '.html';
      let pattern = cfg.pattern;
      let opt = cfg.options;
      bundleTemplate(pattern, outfile, opt, bundleOpts);
    });
}

