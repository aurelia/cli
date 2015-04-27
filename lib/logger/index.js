
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

var prefix = {
      aurelia: 'aurelia'.magenta
    , err    : 'Error'.red
    , ok     : 'OK'.green
};

function Logger(str, arg){
    var args = Array.prototype.slice.call(arguments);
        args = args.slice(2)

    var _template =  str || '';
    var args   = [_template, arg]
    return function(){
        if (typeof arguments[0] === 'string') {
            _template = _template + arguments[0];
            ( arguments.length > 1 ) && args.concat(Array.prototype.slice.call(arguments))
            console.log.apply(console, args)
        }

    }
}


// var _logger =

module.exports.log = new Logger( '[%s]', prefix.aurelia );

module.exports.err = new Logger( '[%s] [%s]', prefix.aurelia, prefix.err );
module.exports.error = module.exports.err


module.exports.ok  = new Logger( '[%s] [%s]', prefix.aurelia, prefix.ok );
module.exports.success = module.exports.ok

