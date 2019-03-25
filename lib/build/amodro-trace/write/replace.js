// browser replacement
// https://github.com/defunctzombie/package-browser-field-spec
// see bundled-source.js for more details

// and also dep string cleanup
// remove tailing '/', '.js'
const esprima = require('esprima');
const astMatcher = require('../../ast-matcher').astMatcher;
// it is definitely a named AMD module at this stage
var amdDep = astMatcher('define(__str, [__anl_deps], __any)');
var cjsDep = astMatcher('require(__any_dep)');
var isUMD = astMatcher('typeof define === "function" && define.amd');
var isUMD2 = astMatcher('typeof define == "function" && define.amd');

module.exports = function stubs(options) {
  options = options || {};

  return function(context, moduleName, filePath, contents) {
    const replacement = options.replacement;
    const toReplace = [];

    const _find = node => {
      if (node.type !== 'Literal') return;
      let dep = node.value;
      // remove tailing '/'
      if (dep.endsWith('/')) {
        dep = dep.slice(0, -1);
      }
      // remove tailing '.js', but only when dep is not
      // referencing a npm package main
      if (dep.endsWith('.js') && !isPackageName(dep)) {
        dep = dep.slice(0, -3);
      }
      // browser replacement;
      if (replacement && replacement[dep]) {
        dep = replacement[dep];
      }

      if (node.value !== dep) {
        toReplace.push({
          start: node.range[0],
          end: node.range[1],
          text: `'${dep}'`
        });
      }
    };

    // need node location
    const parsed = esprima.parse(contents, {range: true});

    if (isUMD(parsed) || isUMD2(parsed)) {
      // Skip lib in umd format, because browersify umd build could
      // use require('./file.js') which we should not strip .js
      return contents;
    }

    const amdMatch = amdDep(parsed);
    if (amdMatch) {
      amdMatch.forEach(result => {
        result.match.deps.forEach(_find);
      });
    }

    const cjsMatch = cjsDep(parsed);
    if (cjsMatch) {
      cjsMatch.forEach(result => {
        _find(result.match.dep);
      });
    }

    // reverse sort by "start"
    toReplace.sort((a, b) => b.start - a.start);

    toReplace.forEach(r => {
      contents = modify(contents, r);
    });

    return contents;
  };
};

function modify(contents, replacement) {
  return contents.slice(0, replacement.start) +
    replacement.text +
    contents.slice(replacement.end);
}

function isPackageName(path) {
  if (path.startsWith('.')) return false;
  const parts = path.split('/');
  // package name, or scope package name
  return parts.length === 1 || (parts.length === 2 && parts[0].startsWith('@'));
}
