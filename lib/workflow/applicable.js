const _ = require('lodash');

// features is like: ['webpack', 'babel']
// condition is like:
// '! webpack', 'webpack && babel', 'requirejs || ! webpack'
// 'not_webpack', 'webpack_and_babel', 'requirejs_or_not_webpack'

// Note the underscore form is to be used in suffix of file name, that
// is why we cannot use &&, ||, ! directly.

// The 3 examples above are translated into
// ! true          => false
// true && true    => true
// false || ! true => false
module.exports = function(features, condition) {
  const expression = _(condition.toLowerCase())
    // Super simple tokenizer: split on underscore or space or &&,||,!.
    // Note with capture group in split regex, the &&,||,! are retained
    // in result array.
    .split(/_|\s|(&&|\|\||!)/)
    .map(_.trim)
    .compact()
    .map(c => {
      if (c === 'and' || c === '&&') return '&&';
      if (c === 'or' || c === '||') return '||';
      if (c === 'not' || c === '!') return '!';
      return features.includes(c) ? 'true' : 'false';
    })
    .join(' ');

  // Eval expression like "! true || false"
  // eslint-disable-next-line no-new-func
  return (new Function(`return ${expression};`))();
};
