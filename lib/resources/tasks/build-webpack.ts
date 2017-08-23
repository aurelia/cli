import * as webpackConfig from '../../webpack.config';
import * as webpack from 'webpack';
import * as project from '../aurelia.json';
import {CLIOptions, Configuration} from 'aurelia-cli';
import * as gulp from 'gulp';
import configureEnvironment from './environment';

const buildOptions = new Configuration(project.build.options);
const production = CLIOptions.getEnvironment() === 'prod';
const server = buildOptions.isApplicable('server');
const extractCss = buildOptions.isApplicable('extractCss');
const coverage = buildOptions.isApplicable('coverage');

const config = webpackConfig({
  production, server, extractCss, coverage
});
const compiler = webpack(config);

function buildWebpack(done) {
  compiler.run(onBuild);
  compiler.plugin('done', () => done());
}

function onBuild(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) console.error(err.details);
    process.exit(1);
  } else {
    process.stdout.write(stats.toString({ colors: require('supports-color') }) + '\n');
  }
}

const build = gulp.series(
  configureEnvironment,
  buildWebpack
);

export {
  config,
  buildWebpack,
  build as default
};
