var Promise = require('bluebird');
var spawn = require('child_process').spawn;
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
function SpawnPromise(options) {

    if (Array.isArray(options)) {
        return multiSpawn(options)
    }

    if ( !options ) {
        logger.err('spawn Requires an options parameter!');
    }
    if ( !options.command ) {
        logger.err('spawn requires a command property on options ');
    }

    if ( options.args && !Array.isArray(options.args) ) {
        logger.err('options.args must be an array');
    }

    return new Promise(function(resolve, reject){

        var child_process = spawn(options.command, options.args);

        child_process.stdout.on('data', function(data){
            resolve(''+data);
            process.stdout.write(''+data);
        });

        child_process.stderr.on('data', function(data){
            reject(''+data);
            process.stdout.write(''+data);
        });

        child_process.on('close',function(code){
            // process.stdout.write(''+code);
        });
    });
};

function multiSpawn(options) {
    return new Promise(function(resolve, reject){
        var index = 0;
        var dataArray = '';
        var next = function(){
            SpawnPromise(options[index])
                .then(function(data){
                    dataArray += data;
                    index++
                    if (options[index]) {
                        return next()
                    } else {
                        resolve(dataArray);
                    }
                })
        }
        next();
    })
}


module.exports = SpawnPromise;
