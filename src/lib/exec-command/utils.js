var fs      = require('fs')
   ,path    = require('path')
   ,_f      = require('fs-utils')
   ,repeat  = require('lodash/string/repeat')
   // ,bold    = require('chalk').bold
;

export function kindof(thing) {
  return {
    get fn() {
      return typeof thing === 'function';
    },
    get array() {
      return Array.isArray(thing);
    },
    get object() {
      return (typeof thing === 'object' && !thing.length);
    },
    get string() {
      return typeof thing === 'string';
    }
  };
}

export function isArgRequired(arg){
  return /\</.test(arg);
}

export function isArgOptional(arg){
  return /\[/.test(arg);
}

export function parseRequiredArg(arg) {
  return arg.match(/\<([a-z]+)\>/)[1];
}

export function parseOptionalArg(arg) {
  console.log(arg.match(/\[([a-z]+)\]/));
  return arg.match(/\[([a-z]+)\]/)[1];
}

export function parseArg(arg) {
  let _optional, _required;
  var name = ( (_optional = isArgOptional(arg)) && parseOptionalArg(arg) )
          || ( (_required = isArgRequired(arg)) && parseRequiredArg(arg) )
          ;
  return {name:name, optional:_optional, required:_required};
}

export function noop(b){return b;}
