'use strict';
var parse = require('./lib/parse'),
    transform = require('./lib/transform');

/**
 * Functions for finding and modifying require.config calls. Mostly a wrapper
 * around lib/ modules, but want to try not exposing the libs directly, and
 * provide a cleaner interface.
 */
var config = {
  /**
   * Finds the first requirejs/require call to require.config/require({}) in a
   * file and returns the value as an object. Will not work with configs that
   * use variable references outside of the config definition. In general,
   * config calls that look more like JSON will work best.
   *
   * @param  {String} contents file contents that might contain a config call.
   * @return {Object} the config. Could be undefined if none found.
   */
  find: function (contents) {
    return parse.findConfig(contents).config;
  },

  /**
   * Modify the contents of a require.config/requirejs.config call and places
   * the modifications bac in the contents. This call will LOSE any existing
   * comments that are in the config string.
   *
   * @param  {String} contents String that may contain a config call
   * @param  {Function} onConfig Function called when the first config
   * call is found. It will be passed an Object which is the current
   * config, and the onConfig function should return an Object to use
   * as the new config that will be serialized into the contents, replacing the
   * old config.
   * @return {String} the contents with the config changes applied.
   */
  modify: function(contents, onConfig) {
    return transform.modifyConfig(contents, onConfig);
  }
};

module.exports = config;
