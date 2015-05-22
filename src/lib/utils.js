var fs      = require('fs')
   ,path    = require('path')
   ,_f      = require('fs-utils')
   ,repeat  = require('lodash/string/repeat')
   // ,bold    = require('chalk').bold
;


export function ucFirst(val) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export function toCamelCase(str) {
  if(str) {
    return str
      .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
      .replace(/\s/g, '')
      .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
  }
}

export function parseList (listString){
  if(listString)
    return listString.split(/[ ,]+/);
}


export function example(name, commands) {

  var maxLen = 0;
  var logs = [];
  console.log('');
  console.log('(%s)(%s): %s', 'aurelia'.magenta, 'HELP'.green, name.green);
  console.log('');
  console.log(' @%s %s','Example'.green, name.green);
  console.log('');

  for (let idx in commands) {
    let cmd = commands[idx];
    let len = cmd.flags.length;
    if (len > maxLen) {maxLen = len;}
  }

  for (let index in commands) {
    let prefix = '   %s %s %s';
    let cmd = commands[index];
    let isMultiInfo = Array.isArray(cmd.info);

    let desc, length, required;

    required = '(' + (cmd.required ? 'required' : 'optional') + ')';

    if (isMultiInfo) {
      length = prefix.length + required.length + cmd.flags.length;
      desc   = cmd.info.shift();
    }

    else {
      length = prefix.length;
      desc   = cmd.info;
    }

    desc = '  | '+ desc;
    if (cmd.flags.length !== maxLen) {
      required = repeat(' ', (maxLen - cmd.flags.length)) + required;
    }
    console.log(prefix, cmd.flags.cyan, required.red, desc);
    isMultiInfo
      && cmd.info.forEach(function(information) {

        console.log('%s %s', repeat(' ', maxLen), information);
    });
  }
  console.log('');
  console.log('');

}
