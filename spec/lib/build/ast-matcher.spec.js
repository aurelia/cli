const esprima = require('esprima');

const astm = require('../../../lib/build/ast-matcher');
const extract = astm.extract;
const compilePattern = astm.compilePattern;
const astMatcher = astm.astMatcher;
const jsDepFinder = astm.jsDepFinder;

const extractTest = function(pattern, part) {
  return extract(compilePattern(pattern), compilePattern(part));
};

describe('compilePattern', () => {
  it('bypass esprima node', () => {
    let node = esprima.parse('a = 1');
    expect(compilePattern(node)).toBe(node);
  });

  it('returns single expression node, unwrap ExpressionStatement', () => {
    let p = compilePattern('a');
    expect(p.type).toBe('Identifier');
    expect(p.name).toBe('a');
  });

  it('rejects multi statements', () => {
    expect(() => compilePattern('a; b = 1')).toThrow();
  });

  it('rejects empty pattern', () => {
    expect(() => compilePattern('// nope')).toThrow();
  });

  it('rejects syntax err', () => {
    expect(() => compilePattern('a+')).toThrow();
  });
});

describe('extract', () => {
  it('bare term has limited support', () => {
    expect(extractTest('__any', 'a(foo)')).toEqual({});
    expect(extractTest('__anl', 'foo,bar')).toBe(false);
    expect(extractTest('__str', '"foo"')).toEqual({});
    expect(extractTest('__str_a', '"foo"')).toEqual({a: 'foo'});
  });

  it('__any matches any node but no extract', () => {
    expect(extractTest('a(__any)', 'a(foo)')).toEqual({});
    expect(extractTest('a(__any)', 'a("foo")')).toEqual({});
    expect(extractTest('a(__any,__any)', 'a("foo", "bar")'))
      .toEqual({});
  });

  it('__any_name matches any node', () => {
    let r = extractTest('a(__any_a)', 'a(foo)');
    expect(Object.keys(r)).toEqual(['a']);
    expect(r.a.type).toBe('Identifier');
    expect(r.a.name).toBe('foo');

    r = extractTest('a(__any_a)', 'a("foo")');
    expect(Object.keys(r)).toEqual(['a']);
    expect(r.a.type).toBe('Literal');
    expect(r.a.value).toBe('foo');
    expect(r.a.raw).toBe('"foo"');

    r = extractTest('a(__any_a,__any_b)', 'a("foo", "bar")');
    expect(Object.keys(r).sort()).toEqual(['a', 'b']);
    expect(r.a.type).toBe('Literal');
    expect(r.a.value).toBe('foo');
    expect(r.a.raw).toBe('"foo"');
    expect(r.b.type).toBe('Literal');
    expect(r.b.value).toBe('bar');
    expect(r.b.raw).toBe('"bar"');
  });

  it('__anl matches nodes array, but no extract', () => {
    let r = extractTest('a(__anl)', 'a(foo, bar)');
    expect(r).toEqual({});
    r = extractTest('a([__anl])', 'a(foo, bar)');
    expect(r).toBe(false);

    r = extractTest('a([__anl])', 'a(foo, bar)');
    expect(r).toBe(false);
    r = extractTest('a([__anl])', 'a([foo, bar])');
    expect(r).toEqual({});
  });

  it('__anl_name matches nodes array', () => {
    let r = extractTest('a(__anl_a)', 'a(foo, bar)');
    expect(Object.keys(r)).toEqual(['a']);
    expect(r.a.length).toBe(2);
    expect(r.a[0].type).toBe('Identifier');
    expect(r.a[0].name).toBe('foo');
    expect(r.a[1].type).toBe('Identifier');
    expect(r.a[1].name).toBe('bar');

    r = extractTest('a(__anl_a)', 'a([foo, bar])');
    expect(Object.keys(r)).toEqual(['a']);
    expect(r.a.length).toBe(1);
    expect(r.a[0].type).toBe('ArrayExpression');
  });

  it('__anl_name matches nodes array case2', () => {
    let r = extractTest('a([__anl_a])', 'a([foo, bar])');
    expect(Object.keys(r)).toEqual(['a']);
    expect(r.a.length).toBe(2);
    expect(r.a[0].type).toBe('Identifier');
    expect(r.a[0].name).toBe('foo');
    expect(r.a[1].type).toBe('Identifier');
    expect(r.a[1].name).toBe('bar');

    r = extractTest('a([__anl_a])', 'a(foo, bar)');
    expect(r).toBe(false);
  });

  it('extracts matching string literal', () => {
    expect(extractTest('a(__str_a)', 'a(foo)')).toBe(false);
    expect(extractTest('a(__str_a)', 'a("foo")')).toEqual({a: 'foo'});
    expect(extractTest('a(__str_a,__str_b)', 'a("foo", "bar")'))
      .toEqual({a: 'foo', b: 'bar'});
  });

  it('matches string literal', () => {
    expect(extractTest('a(__str)', 'a(foo)')).toBe(false);
    expect(extractTest('a(__str)', 'a("foo")')).toEqual({});
    expect(extractTest('a(__str,__str)', 'a("foo", "bar")'))
      .toEqual({});
  });

  it('extracts matching array string literal', () => {
    expect(extractTest('a(__arr_a)', 'a(["foo", "bar"])'))
      .toBe(false);
    expect(extractTest('a(__arr_a)', 'a("foo", "bar")'))
      .toEqual({a: ['foo', 'bar']});

    expect(extractTest('a([__arr_a])', 'a(["foo", "bar"])'))
      .toEqual({a: ['foo', 'bar']});
    expect(extractTest('a([__arr_a])', 'a("foo", "bar")'))
      .toBe(false);

    expect(extractTest('a([__arr_a])', 'a(["foo", partial, literal, arr, "bar"])'))
      .toEqual({a: ['foo', 'bar']});
    expect(extractTest('a([__arr_a])', 'a([no, literal, arr])'))
      .toBe(false);
  });

  it('matches array string literal', () => {
    expect(extractTest('a(__arr)', 'a(["foo", "bar"])'))
      .toBe(false);
    expect(extractTest('a(__arr)', 'a("foo", "bar")'))
      .toEqual({});

    expect(extractTest('a([__arr])', 'a(["foo", "bar"])'))
      .toEqual({});
    expect(extractTest('a([__arr])', 'a("foo", "bar")'))
      .toBe(false);

    expect(extractTest('a([__arr])', 'a(["foo", partial, literal, arr, "bar"])'))
      .toEqual({});
    expect(extractTest('a([__arr])', 'a([no, literal, arr])'))
      .toBe(false);
  });

  it('extracts matching array string literal, and string literal', () => {
    expect(extractTest('a(__str_a, __arr_b)', 'a("foo", "bar")'))
      .toBe(false);
    expect(extractTest('a(__str_a, __arr_b)', 'a("foo", ["bar"])'))
      .toBe(false);
    expect(extractTest('a(__str_a, [__arr_b])', 'a("foo", ["bar"])'))
      .toEqual({a: 'foo', b: ['bar']});
  });

  it('support wildcard', () => {
    expect(extractTest('__any.a(__str_a, [__arr_b])', 'a("foo", ["bar"])'))
      .toBe(false);
    expect(extractTest('__any.a(__str_a, [__arr_b])', 'bar.a("foo", ["bar"])'))
      .toEqual({a: 'foo', b: ['bar']});
  });

  it('try complex pattern', () => {
    expect(extractTest(
      '(0, __any.noView)([__arr_deps], __str_baseUrl)',
      '(0, _aureliaFramework.noView)(["foo", "bar"])'
    )).toBe(false);
    expect(extractTest(
      '(__any, __any.noView)([__arr_deps], __str_baseUrl)',
      '(1, _aureliaFramework.noView)(["./foo", "./bar"], "lorem")'
    )).toEqual({deps: ['./foo', './bar'], baseUrl: 'lorem'});
  });

  it('matches string literal without testing raw', () => {
    expect(extractTest('a("foo")', "a('foo')")).toEqual({});
  });
});

describe('astMatcher', () => {
  it('builds matcher', () => {
    expect(typeof astMatcher('a(__str_a)')).toBe('function');
  });
});

describe('matcher built by astMatcher', () => {
  it('returns undefined on no match', () => {
    let m = astMatcher('__any.method(__str_foo, [__arr_opts])');
    let r = m('au.method(["b", "c"]); method("d", ["e"])');
    expect(r).toBeUndefined();
  });

  it('accepts both string input or node input', () => {
    let m = astMatcher('a(__str_foo)');
    expect(m('a("foo")').length).toBe(1);
    expect(m(esprima.parse('a("foo")')).length).toBe(1);
  });

  it('rejects unknown input', () => {
    let m = astMatcher('a(__str_foo)');
    expect(() => m(Buffer.from('a("foo")'))).toThrow();
  });

  it('returns matches and matching nodes', () => {
    let m = astMatcher('__any.method(__str_foo, [__arr_opts])');
    let r = m('function test(au, jq) { au.method("a", ["b", "c"]); jq.method("d", ["e"]); }');
    expect(r.length).toBe(2);

    expect(r[0].match).toEqual({foo: 'a', opts: ['b', 'c']});
    expect(r[0].node.type).toBe('CallExpression');
    expect(r[0].node.callee.object.name).toBe('au');
    expect(r[1].match).toEqual({foo: 'd', opts: ['e']});
    expect(r[1].node.type).toBe('CallExpression');
    expect(r[1].node.callee.object.name).toBe('jq');
  });

  it('returns matching nodes with no named matches', () => {
    let m = astMatcher('__any.method(__any, [__anl])');
    let r = m('function test(au, jq) { au.method("a", ["b", "c"]); jq.method("d", ["e"]); }');
    expect(r.length).toBe(2);

    expect(r[0].match).toEqual({});
    expect(r[0].node.type).toBe('CallExpression');
    expect(r[0].node.callee.object.name).toBe('au');
    expect(r[1].match).toEqual({});
    expect(r[1].node.type).toBe('CallExpression');
    expect(r[1].node.callee.object.name).toBe('jq');
  });

  it('complex if statement', () => {
    let m = astMatcher('if (__any) { __anl }');
    let r = m('if (yes) { a(); b(); }');
    expect(r.length).toBe(1);

    r = m('if (yes) { a(); b(); } else {}');
    expect(r).toBeUndefined();

    r = m('if (c && d) { a(); b(); }');
    expect(r.length).toBe(1);
  });

  it('continues to match even after match found', () => {
    let m = astMatcher('__any.__any_m()');
    let r = m('a.m1().m2()');
    expect(r.length).toBe(2);
    expect(r.map(i => i.match.m.name).sort()).toEqual(['m1', 'm2']);
  });
});

describe('jsDepFinder', () => {
  it('rejects empty input', () => {
    expect(() => jsDepFinder()).toThrow();
  });

  it('complains about wrong exp', () => {
    expect(() => jsDepFinder('+++')).toThrow();
  });

  it('returns empty array on no match', () => {
    let f = jsDepFinder('a(__dep)');
    expect(f('fds("a")')).toEqual([]);
  });

  it('finds matching dep', () => {
    let f = jsDepFinder('a(__dep)');
    expect(f('a("a"); b("b"); b.a("c")')).toEqual(['a']);
  });

  it('finds matching dep, accepts esprima node as input', () => {
    let f = jsDepFinder('a(__dep)');
    expect(f(esprima.parse('a("a"); b("b"); b.a("c")'))).toEqual(['a']);
  });

  it('finds matching dep by matching length', () => {
    let f = jsDepFinder('a(__dep, __dep)');
    expect(f('a("a"); a("b", "c"); a("d", "e", "f")')).toEqual(['b', 'c']);
  });

  it('finds matching dep with wild card', () => {
    let f = jsDepFinder('__any.a(__dep)');
    expect(f('a("a"); b.a("b"); c["f"].a("c")')).toEqual(['b', 'c']);
  });

  it('find matching deps', () => {
    let f = jsDepFinder('a(__deps)');
    expect(f('a("a"); a("b", "c");')).toEqual(['a', 'b', 'c']);
  });

  it('accepts multiple patterns', () => {
    let f = jsDepFinder('a(__deps)', '__any.a(__deps)');
    expect(f('fds("a")')).toEqual([]);
    expect(f('a("a"); b("b"); b.a("c"); c.a("d", "e"); a("f", "g")'))
      .toEqual(['a', 'c', 'd', 'e', 'f', 'g']);

    f = jsDepFinder('a(__dep)', '__any.globalResources([__deps])');
    expect(f('a("a"); a("b"); config.globalResources(["./c", "./d"])'))
      .toEqual(['a', 'b', './c', './d']);
  });
});
