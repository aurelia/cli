var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var logger = require('./logger');
var map    = require('lodash/collection/map');
/**
 * PromiseSpawn                     Create Promise that returns a child_process output
 *                                  Log the child's output to the current process.
 *                                  Unless otherwise specified.
 *
 * @param   {Object}   options      Requires an options parameter to pass to the child_process
 *                                  Example Below
 * @return  {Promise}  new Promise
 *
 * @options :
 *     command: 'git',              The command to run only, !(flags)
 *     args   : ['branch', '-r']    Must be an Array only containing flags
 *                                  This includes values of options.
 *
 * @usage
 *
 *      var SpawnPromise = require('lib/spawn')
 *      var options = {
 *          command: 'git',
 *          args: ['commit', '-m', 'Whats up child process?']
 *      };
 *
 *      SpawnPromise(options)
 *          .then(  )  // The output form your command line
 *          .catch(  ) // The Error from your command line
 */
export function Spawn(options) {
  if (Array.isArray(options)) {
    return Promise.join(map(options, SpawnPromise));
  }

  if (!options) {
    logger.err('spawn Requires an options parameter!');
  }
  if (!options.command) {
    logger.err('spawn requires a command property on options ');
  }

  if (options.args && !Array.isArray(options.args)) {
    logger.err('options.args must be an array');
  }

  return new Promise(function(resolve, reject) {

    var child_process = spawn(options.command, options.args);

    child_process.stdout.on('data', function(data) {
      resolve('' + data);
      process.stdout.write('' + data);
    });

    child_process.stderr.on('data', function(data) {
      if (options.command !== 'git') {
        reject('' + data);
      } else {
        resolve('' + data);
      }
      process.stdout.write('' + data);
    });
    // Comment this line in if you are needing the code
    // child_process.on('close', function(code) {
    //   // reject('' + code);
    //   // process.stdout.write(''+code);
    // });
  });
}
