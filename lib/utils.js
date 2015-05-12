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

function parseList (listString){
  if(listString)
    return listString.split(/[ ,]+/);
}

module.exports = {
  ucFirst: ucFirst,
  toCamelCase: toCamelCase,
  parseList: parseList
};
