export async function reportReadiness(options) {
  const uri = await createDomain(options);
  const yargs = (await import('yargs')).default;
  const argv = yargs.argv;
  argv.color = (await import('supports-color')).default;
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
};

async function createDomain(opts) {
  const protocol = opts.https ? 'https' : 'http';
  const url = await import('node:url');

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
