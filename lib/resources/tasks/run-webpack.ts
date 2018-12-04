import {config} from './build';
import configureEnvironment from './environment';
import * as webpack from 'webpack';
import * as Server from 'webpack-dev-server';
import * as project from '../aurelia.json';
import {CLIOptions, reportWebpackReadiness} from 'aurelia-cli';
import * as gulp from 'gulp';

function runWebpack(done) {
  // https://webpack.github.io/docs/webpack-dev-server.html
  let opts = {
    host: 'localhost',
    publicPath: config.output.publicPath,
    filename: config.output.filename,
    hot: project.platform.hmr || CLIOptions.hasFlag('hmr'),
    port: project.platform.port,
    contentBase: config.output.path,
    historyApiFallback: true,
    open: project.platform.open,
    stats: {
      colors: require('supports-color')
    },
    https: config.devServer.https
  } as any;

  // Add the webpack-dev-server client to the webpack entry point
  // The path for the client to use such as `webpack-dev-server/client?http://${opts.host}:${opts.port}/` is not required
  // The path used is derived from window.location in the browser and output.publicPath in the webpack.config.
  if (project.platform.hmr || CLIOptions.hasFlag('hmr')) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.entry.app.unshift('webpack-dev-server/client', 'webpack/hot/dev-server');
  } else {
    // removed "<script src="/webpack-dev-server.js"></script>" from index.ejs in favour of this method
    config.entry.app.unshift('webpack-dev-server/client');
  }

  const compiler = webpack(config);
  let server = new Server(compiler, opts);

  server.listen(opts.port, opts.host, function(err) {
    if (err) throw err;

    reportWebpackReadiness(opts);
    done();
  });
}

const run = gulp.series(
  configureEnvironment,
  runWebpack
);

export { run as default };
