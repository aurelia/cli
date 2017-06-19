import {config} from './build';
import webpack from 'webpack';
import Server from 'webpack-dev-server';
import open from 'opn';
import yargs from 'yargs';
import url from 'url';
import project from '../aurelia.json';
import {CLIOptions} from 'aurelia-cli';

const argv = yargs.argv;
argv.color = require('supports-color');

function run(done) {
  let opts = {
    host: 'localhost',
    publicPath: config.output.publicPath,
    filename: config.output.filename,
    watchOptions: undefined,
    hot: project.platform.hmr,
    clientLogLevel: 'info',
    port: project.platform.port,

    contentBase: config.output.path,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true,

    open: project.platform.open,
    stats: {
      cached: false,
      cachedAssets: false,
      colors: argv.color
    }
  };

  if (!CLIOptions.hasFlag('watch')) {
    opts.watch = false;
  }

  if (project.platform.hmr) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.entry.app.unshift(`webpack-dev-server/client?http://${opts.host}:${opts.port}/`, 'webpack/hot/dev-server');
  }

  const compiler = webpack(config);
  let server = new Server(compiler, opts);

  server.listen(opts.port, opts.host, function(err) {
    if (err) throw err;
    reportReadiness(createDomain(opts), opts);
    done();
  });
}

function reportReadiness(uri, options) {
  const useColor = argv.color;

  let startSentence = `Project is running at ${colorInfo(useColor, uri)}`;

  if (options.socket) {
    startSentence = `Listening to socket at ${colorInfo(useColor, options.socket)}`;
  }
  console.log((argv.progress ? '\n' : '') + startSentence);

  console.log(`webpack output is served from ${colorInfo(useColor, options.publicPath)}`);
  const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase;

  if (contentBase) {
    console.log(`Content not from webpack is served from ${colorInfo(useColor, contentBase)}`);
  }

  if (options.historyApiFallback) {
    console.log(`404s will fallback to ${colorInfo(useColor, options.historyApiFallback.index || '/index.html')}`);
  }

  if (options.open) {
    open(uri).catch(function() {
      console.log('Unable to open browser. If you are running in a headless environment, please do not use the open flag.');
    });
  }
}

function createDomain(opts) {
  const protocol = opts.https ? 'https' : 'http';

  // the formatted domain (url without path) of the webpack server
  return opts.public ? `${protocol}://${opts.public}` : url.format({
    protocol: protocol,
    hostname: opts.host,
    port: opts.socket ? 0 : opts.port.toString()
  });
}

function colorInfo(useColor, msg) {
  if (useColor) {
    // Make text blue and bold, so it *pops*
    return `\u001b[1m\u001b[33m${msg}\u001b[39m\u001b[22m`;
  }
  return msg;
}

export { run as default };
