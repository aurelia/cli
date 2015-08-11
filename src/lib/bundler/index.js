import { bundleJS } from './js-bundler';
import { bundleTemplate } from './template-bundler';

export default function bundle(config) {
  var jsConfig = config.js;
  var templateConfig = config.template;

  Object.keys(jsConfig)
    .forEach(key  => {
      let cfg = jsConfig[key];
      let outfile = key + '.js';
      let opt = cfg.options;

      opt.force = config.force;
      opt.packagePath = config.packagePath;

      bundleJS(cfg.modules, outfile, opt);
    });

  if (!templateConfig) return;

  Object.keys(templateConfig)
    .forEach(key  => {
      let cfg = templateConfig[key];
      let outfile = key + '.html';
      let pattern = cfg.pattern;
      let opt = cfg.options;

      opt.force = config.force;
      opt.packagePath = config.packagePath;

      bundleTemplate(pattern, outfile, opt);
    });
}

