var Promise = require('bluebird');
var span = require('child_process').spawn;
var logger = require('./logger');

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

module.exports = SpawnPromise = function(options) {

    if ( !options ) {
        logger.err('spawn Requires an options parameter!');
    }

    if ( !options.command ) {
        logger.err('spawn requires a command property on options ');
    }

    if ( oprion.args && !Array.isArray(options.agrs) ) {
        logger.err('options.args must be an array');
    }

    return new Promise(function(resolve, reject){

        var child_process = spawn(options.commad, options.args);

        child_process.onStdin(function(data){
            resolve(data);
            !options.silent
                && process.stdout.write(''+data);
        });

        child_process.onStderr(function(data){
            reject(data);
            !options.silent
                && process.stdout.write(''+data);
        });

        child_process.onClose(function(code){

            !options.silent
               && process.stdout.write(code);
        });
    });
};
