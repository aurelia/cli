if (!String.prototype.magenta) {
  Object.defineProperties(String.prototype, {
    magenta: { get: function(){ return '\x1B[35m' + this.valueOf() + '\x1B[39m'; } },
    yellow:  { get: function(){ return '\x1B[33m' + this.valueOf() + '\x1B[39m'; } },
    white:   { get: function(){ return '\x1B[37m' + this.valueOf() + '\x1B[39m'; } },
    black:   { get: function(){ return '\x1B[30m' + this.valueOf() + '\x1B[39m'; } },
    green:   { get: function(){ return '\x1B[32m' + this.valueOf() + '\x1B[39m'; } },
    grey:    { get: function(){ return '\x1B[90m' + this.valueOf() + '\x1B[39m'; } },
    blue:    { get: function(){ return '\x1B[34m' + this.valueOf() + '\x1B[39m'; } },
    cyan:    { get: function(){ return '\x1B[36m' + this.valueOf() + '\x1B[39m'; } },
    red:     { get: function(){ return '\x1B[31m' + this.valueOf() + '\x1B[39m'; } },
  });
}

var prefix = {
  aurelia: 'aurelia'.magenta
  , err    : 'Error'.red
  , ok     : 'OK'.green
};

// log
// color   magenta
// prefix [aurelia]:
export function log(){
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.aurelia);
  var template = '(%s) ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

// err
// color red
// prefix [aurelia] [Error]:
export function err(){
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.err);
  args.unshift(prefix.aurelia);
  var template = '(%s) (%s): ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

// ok
// color green
// prefix [aurelia] [OK]:
export function ok(){
  var args = Array.prototype.slice.call(arguments).slice(1);
  args.unshift(prefix.ok);
  args.unshift(prefix.aurelia);
  var template = '(%s) (%s): ' + arguments[0];
  args.unshift(template);
  console.log.apply(console, args);
}

// Use aliases as some like to use more readable methods, like "success" over "ok"
export let error   = err;
export let success = ok;