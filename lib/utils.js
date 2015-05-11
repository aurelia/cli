var fs      = require('fs')
   ,path    = require('path')
   ,_f      = require('fs-utils')
   ;

function ucFirst(val) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function toCamelCase(str) {
  if(str) {
    return str
      .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
      .replace(/\s/g, '')
      .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
  }
}

function makeDirectories(dirpath, cb) {

  var isDir = _f.isDir(dirpath);
  var withCwd = dirpath.split(process.cwd());
  var parts = (withCwd.length > 1)
            ? withCwd[1].split('/')
            : dirpath.split(path.sep);

  var dir   = parts.shift();
  parts.forEach(function(part, index){
    dir  = path.join(dir, part);
    if (!_f.isDir(dir)) {
      fs.mkdir(dir, function(err){
        if (err) {
          cb(err, null);
          console.error(err);
        }
        else if ( !parts[index + 1] ){
          cb(null);
        }
        else {
          index++;
        }
      });
    } else if ( !parts[index + 1] ){
          cb(null);
    }
  });
}
module.exports = {
   ucFirst         : ucFirst
  ,toCamelCase     : toCamelCase
  ,makeDirectories : makeDirectories
};
