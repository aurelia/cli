import * as meriyah from 'meriyah';

const STOP = false;
const SKIP_BRANCH = 1;

// ignore position info, and raw
const IGNORED_KEYS = ['start', 'end', 'loc', 'location', 'locations', 'line', 'column', 'range', 'ranges', 'raw'];

// From an meriyah example for traversing its ast.
// modified to support branch skip.
function traverse(object: meriyah.ESTree.Node, visitor: (node: meriyah.ESTree.CallExpression) => void) {
  let child: meriyah.ESTree.Node;
  if (!object) return;

  const r = visitor.call(null, object);
  if (r === STOP) return STOP; // stop whole traverse immediately
  if (r === SKIP_BRANCH) return; // skip going into AST branch

  for (let i = 0, keys = Object.keys(object); i < keys.length; i++) {
    const key = keys[i];
    if (IGNORED_KEYS.indexOf(key) !== -1) continue;

    child = object[key];
    if (typeof child === 'object' && child !== null) {
      if (traverse(child, visitor) === STOP) {
        return STOP;
      }
    }
  }
}

const ANY = 1;
const ANL = 2;
const STR = 3;
const ARR = 4;

function matchTerm(pattern: meriyah.ESTree.Node) {
  let possible: string;
  if (pattern.type === 'Identifier') {
    possible = pattern.name.toString();
  } else if (pattern.type === 'ExpressionStatement' &&
             pattern.expression.type === 'Identifier') {
    possible = pattern.expression.name.toString();
  }

  if (!possible || !possible.startsWith('__')) return;

  let type: number | undefined;
  if (possible === '__any' || possible.startsWith('__any_')) {
    type = ANY;
  } else if (possible === '__anl' || possible.startsWith('__anl_')) {
    type = ANL;
  } else if (possible === '__str' || possible.startsWith('__str_')) {
    type = STR;
  } else if (possible === '__arr' || possible.startsWith('__arr_')) {
    type = ARR;
  }

  if (type) return {type: type, name: possible.slice(6)};
}

/**
 * Extract info from a partial meriyah syntax tree, see astMatcher for pattern format
 * @param pattern The pattern used on matching
 * @param part The target partial syntax tree
 * @return Returns named matches, or false.
 */
export function extract(pattern: meriyah.ESTree.Node, part: meriyah.ESTree.Node): unknown | false {
  if (!pattern) throw new Error('missing pattern');
  // no match
  if (!part) return STOP;

  const term = matchTerm(pattern);
  if (term) {
    // if single __any
    if (term.type === ANY) {
      if (term.name) {
        // if __any_foo
        // get result {foo: astNode}
        const r = {};
        r[term.name] = part;
        return r;
      }
      // always match
      return {};

    // if single __str_foo
    } else if (term.type === STR) {
      if (part.type === 'Literal') {
        if (term.name) {
          // get result {foo: value}
          const r = {};
          r[term.name] = part.value;
          return r;
        }
        // always match
        return {};
      }
      // no match
      return STOP;
    }
  }


  if (Array.isArray(pattern)) {
    // no match
    if (!Array.isArray(part)) return STOP;

    if (pattern.length === 1) {
      const arrTerm = matchTerm(pattern[0]);
      if (arrTerm) {
        // if single __arr_foo
        if (arrTerm.type === ARR) {
          // find all or partial Literals in an array
          const arr = part.filter(it => it.type === 'Literal').map(it => it.value);
          if (arr.length) {
            if (arrTerm.name) {
              // get result {foo: array}
              const r = {};
              r[arrTerm.name] = arr;
              return r;
            }
            // always match
            return {};
          }
          // no match
          return STOP;
        } else if (arrTerm.type === ANL) {
          if (arrTerm.name) {
            // get result {foo: nodes array}
            const r = {};
            r[arrTerm.name] = part;
            return r;
          }

          // always match
          return {};
        }
      }
    }

    if (pattern.length !== part.length) {
      // no match
      return STOP;
    }
  }

  const allResult = {};

  for (let i = 0, keys = Object.keys(pattern); i < keys.length; i++) {
    const key = keys[i];
    if (IGNORED_KEYS.indexOf(key) !== -1) continue;

    const nextPattern = pattern[key];
    const nextPart = part[key];

    if (!nextPattern || typeof nextPattern !== 'object') {
      // primitive value. string or null
      if (nextPattern === nextPart) continue;

      // no match
      return STOP;
    }

    const result = extract(nextPattern, nextPart);
    // no match
    if (result === STOP) return STOP;
    if (result) Object.assign(allResult, result);
  }

  return allResult;
};

/**
 * Compile a pattern into meriyah syntax tree
 * @param pattern The pattern used on matching, can be a string or meriyah node
 * @return Returns an meriyah node to be used as pattern in extract(pattern, part)
 */
export function compilePattern(pattern: string | meriyah.ESTree.Node) {
  // pass meriyah syntax tree obj
  if (typeof pattern !== 'string' && pattern.type) return pattern;

  if (typeof pattern !== 'string') {
    throw new Error('input pattern is neither a string nor an meriyah node.');
  }

  let exp: meriyah.ESTree.Program | meriyah.ESTree.Statement | meriyah.ESTree.Expression = meriyah.parseScript(pattern, {next: true, webcompat: true});

  if (exp.type !== 'Program' || !exp.body) {
    throw new Error(`Not a valid expression:  "${pattern}".`);
  }

  if (exp.body.length === 0) {
    throw new Error(`There is no statement in pattern "${pattern}".`);
  }

  if (exp.body.length > 1) {
    throw new Error(`Multiple statements is not supported "${pattern}".`);
  }

  exp = exp.body[0];
  // get the real expression underneath
  if (exp.type === 'ExpressionStatement') exp = exp.expression;
  return exp;
};

function ensureParsed(codeOrNode: string | meriyah.ESTree.Node) {
  // bypass parsed node
  if (typeof codeOrNode !== 'string' && 'type' in codeOrNode) {
    return codeOrNode;
  }
  if (typeof codeOrNode === 'string') {
    return meriyah.parseScript(codeOrNode, {next: true, webcompat: true});
  }
  throw new Error('unknown `codeOrNode` type.')
}

/**
 * Pattern matching using AST on JavaScript source code
 * @param pattern The pattern to be matched
 * @return Returns a function that takes source code string (or meriyah syntax tree) as input, produces matched result or undefined.
 *
 * __any       matches any single node, but no extract
 * __anl       matches array of nodes, but no extract
 * __str       matches string literal, but no extract
 * __arr       matches array of partial string literals, but no extract
 * __any_aName matches single node, return {aName: node}
 * __anl_aName matches array of nodes, return {aName: array_of_nodes}
 * __str_aName matches string literal, return {aName: value}
 * __arr_aName matches array, extract string literals, return {aName: [values]}
 *
 * note: __arr_aName can match partial array
 *       [foo, "foo", lorem, "bar", lorem] => ["foo", "bar"]
 *
 * note: __anl, and __arr_*
 *       use method(__anl) or method(__arr_a) to match method(a, "b");
 *       use method([__anl]) or method([__arr_a]) to match method([a, "b"]);
 *
 * Usage:
 *   let m = astMatcher('__any.method(__str_foo, [__arr_opts])');
 *   m('au.method("a", ["b", "c"]); jq.method("d", ["e"])');
 *
 *   => [
 *         {match: {foo: "a", opts: ["b", "c"]}, node: <CallExpression node> }
 *         {match: {foo: "d", opts: ["e"]}, node: <CallExpression node> }
 *      ]
 */
export function astMatcher(pattern: string | meriyah.ESTree.Node) {
  const pat = compilePattern(pattern);

  return function(jsStr: string | meriyah.ESTree.Node) {
    const node = ensureParsed(jsStr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches: { match: any, node: meriyah.ESTree.CallExpression}[] = [];

    traverse(node, n => {
      const m = extract(pat, n);
      if (m) {
        matches.push({
          match: m,
          node: n   // this is the full matching node
        });
        // found a match, don't go deeper on this tree branch
        // return SKIP_BRANCH;
        // don't skip branch in order to catch both .m1() ad .m2()
        // astMater('__any.__any_m()')('a.m1().m2()')
      }
    });

    return matches.length ? matches : undefined;
  };
};

/**
 * Dependency search for dummies, this is a high level api to simplify the usage of astMatcher
 * @param arguments Multiple patterns to match, instead of using __str_/__arr_, use __dep and __deps to match string or partial string array.
 * @return Returns a function that takes source code string (or meriyah syntax tree) as input, produces an array of string matched, or empty array.
 *
 * Usage:
 *   let f = jsDepFinder('a(__dep)', '__any.globalResources([__deps])');
 *   f('a("a"); a("b"); config.globalResources(["./c", "./d"])');
 *
 *   => ['a', 'b', './c', './d']
 */
export function jsDepFinder(...args: string[]) {
  if (args.length === 0) {
    throw new Error('No patterns provided.');
  }

  let seed = 0;

  const patterns = Array.prototype.map.call(args, p =>
    // replace __dep and __deps into
    // __str_1, __str_2, __arr_3
    // wantArr is the result of (s?)
    compilePattern(p.replace(/__dep(s?)/g, (m, wantArr) =>
      (wantArr ? '__arr_' : '__str_') + (++seed)
    ))
  );

  const len = patterns.length;

  return function(jsStr: string | meriyah.ESTree.Node) {
    const node = ensureParsed(jsStr);

    const deps = [];

    // directly use extract() instead of astMatcher()
    // for efficiency
    traverse(node, n => {
      for (let i = 0; i < len; i += 1) {
        const result = extract(patterns[i], n);
        if (result) {
          // result is like {"1": "dep1", "2": ["dep2", "dep3"]}
          // we only want values
          Object.keys(result).forEach(k => {
            const d = result[k];
            if (typeof d === 'string') deps.push(d);
            else deps.push(...d);
          });

          // found a match, don't try other pattern
          break;
        }
      }
    });

    return deps;
  };
};
