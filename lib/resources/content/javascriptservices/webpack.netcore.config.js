const webpackConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
var originalConfig = webpackConfig({});

module.exports = () => {
  let config = originalConfig;
  // output files without hashes
  config.output.filename = '[name].bundle.js';
  config.plugins.splice(config.plugins.findIndex((x) => x.constructor.name === HtmlWebpackPlugin.name), 1);
  // fix output path for .net core development
  config.module.rules = config.module.rules.map(x => {
    if (x.loader && (x.loader === 'url-loader' || x.loader === 'file-loader')) {
      if (!x.options) {
        x.options = {};
      }
      x.options.publicPath = project.platform.output.replace('wwwroot', '') + '/';
    }
    return x;
  });
  config.plugins = [
    // first clean the output directory
    new CleanWebpackPlugin([config.output.path]),
    ...config.plugins
  ];

  return config;
};
