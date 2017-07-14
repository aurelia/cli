import {config} from './build';
import webpack from 'webpack';
import Server from 'webpack-dev-server';
import project from '../aurelia.json';
import {CLIOptions, reportWebpackReadiness} from 'aurelia-cli';

function run(done) {
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
    }
  };

  if (!CLIOptions.hasFlag('watch')) {
    opts.watch = false;
  }

  if (project.platform.hmr || CLIOptions.hasFlag('hmr')) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.entry.app.unshift(`webpack-dev-server/client?http://${opts.host}:${opts.port}/`, 'webpack/hot/dev-server');
  }

  const compiler = webpack(config);
  let server = new Server(compiler, opts);

  server.listen(opts.port, opts.host, function(err) {
    if (err) throw err;
    reportWebpackReadiness(opts);
    done();
  });
}

export { run as default };
