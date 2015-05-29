
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

export function dashToCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); })
}

export function parseList (listString){
  if(listString)
    return listString.split(/[ ,]+/);
}

module.exports = {
  ucFirst: ucFirst,
  toCamelCase: toCamelCase,
  dashToCamelCase: dashToCamelCase,
  parseList: parseList
};
