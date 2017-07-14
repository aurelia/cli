import * as webpackConfig from '../../webpack.config';
import * as webpack from 'webpack';
import * as project from '../aurelia.json';
import {CLIOptions, Configuration} from 'aurelia-cli';

const buildOptions = new Configuration(project.build.options);
const isProd = CLIOptions.getEnvironment() === 'prod';
const server = buildOptions.isApplicable('server');
const extractCss = buildOptions.isApplicable('extractCss');
const coverage = buildOptions.isApplicable('coverage');

const config = webpackConfig({
  isProd, server, extractCss, coverage
});
const compiler = webpack(config);

function build(done) {
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

export {
  config,
  build as default
};
