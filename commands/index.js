var isArg, exists = require('fs').existsSync;

// Command is a service for routing commands to specific files.
// This service is assuming that the command file is a function..
module.exports = function Command(cmd) {
  cmd = (__dirname + '/' + cmd );
  // Checking for whether the files exists at this point, should only be for development
  // Otherwise, we know the files exists, so this just becomes an extra function call
  // Once fully deployed, we shouldn't be checking whether the command file exists.
  isArg = exists(cmd);

  // We probably should not be exiting here.
  // It is best to return here and exit at the root.
  // This will only be a defect on a Linux machine.
  // Let's consider making an exiting service that will exit once the commands are done, or on errors.
  if (!isArg) {
    cmd += '.js';
    isArg = exists(cmd);

    if(!isArg) {
      console.log('[%s] Command %s does not exist!', 'Error'.red, cmd.red);
      // return;
      process.exit(1);
    }
  }

  //return a function for program.action() to call, and pass the arguments through.
  return function () {
    return require(cmd).apply(this, arguments);
  }
};
