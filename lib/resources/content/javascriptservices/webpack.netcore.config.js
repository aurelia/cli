const webpackConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var originalConfig = webpackConfig({});

module.exports = () => {
  let config = originalConfig;
  // output files without hashes
  config.output.filename = '[name].bundle.js';
  config.plugins.splice(config.plugins.indexOf(HtmlWebpackPlugin));
  config.plugins = [
    // first clean the output directory
    new CleanWebpackPlugin([config.output.path]),
    ...config.plugins
  ];

  return config;
};
