const isDebugMode = typeof v8debug === 'object' || 
                    /--debug|--inspect/.test(process.execArgv.join(' ')) ||
                    process.env.VSCODE_INSPECTOR_OPTIONS;

if (isDebugMode) {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000; // 1 minute timeout in debug mode
  console.log('Debug mode detected - extended timeouts enabled');
}
