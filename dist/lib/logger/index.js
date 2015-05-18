'use strict';

Object.defineProperties(String.prototype, {
  magenta: { get: function get() {
      return '\u001b[35m' + this.valueOf() + '\u001b[39m';
    } },
  yellow: { get: function get() {
      return '\u001b[33m' + this.valueOf() + '\u001b[39m';
    } },
  white: { get: function get() {
      return '\u001b[37m' + this.valueOf() + '\u001b[39m';
    } },
  black: { get: function get() {
      return '\u001b[30m' + this.valueOf() + '\u001b[39m';
    } },
  green: { get: function get() {
      return '\u001b[32m' + this.valueOf() + '\u001b[39m';
    } },
  grey: { get: function get() {
      return '\u001b[90m' + this.valueOf() + '\u001b[39m';
    } },
  blue: { get: function get() {
      return '\u001b[34m' + this.valueOf() + '\u001b[39m';
    } },
  cyan: { get: function get() {
      return '\u001b[36m' + this.valueOf() + '\u001b[39m';
    } },
  red: { get: function get() {
      return '\u001b[31m' + this.valueOf() + '\u001b[39m';
    } } });

var prefix = {
  aurelia: 'aurelia'.magenta,
  err: 'Error'.red,
  ok: 'OK'.green
};

function log() {
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.aurelia);
  var template = '[%s] ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

function err() {
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.err);
  args.unshift(prefix.aurelia);
  var template = '[%s] [%s]: ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

function ok() {
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.ok);
  args.unshift(prefix.aurelia);
  var template = '[%s] [%s]: ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

module.exports = {
  ok: ok,
  log: log,
  err: err,
  error: err,
  success: ok
};