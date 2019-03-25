const fixupCSSUrls = require('../../../lib/build/inject-css').fixupCSSUrls;

// tests partly copied from
// https://github.com/webpack-contrib/style-loader/blob/master/test/fixUrls.test.js
describe('fixupCSSUrls', () => {
  it('throws on null/undefined', () => {
    expect(() => fixupCSSUrls('foo/bar', null)).toThrow();
    expect(() => fixupCSSUrls('foo/bar', undefined)).toThrow();
  });

  it('Blank css is not modified', () => {
    const css = '';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it('No url is not modified', () => {
    const css = 'body { }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (no quotes)", () => {
    const css = 'body { background-image:url ( http://example.com/bg.jpg  ); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (no quotes, spaces)", () => {
    const css = 'body { background-image:url ( http://example.com/bg.jpg  ); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (double quotes)", () => {
    const css = 'body { background-image:url(\"http://example.com/bg.jpg\"); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (double quotes, spaces)", () => {
    const css = 'body { background-image:url ( \"http://example.com/bg.jpg\" ); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (single quotes)", () => {
    const css = 'body { background-image:url(\'http://example.com/bg.jpg\'); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Full url isn't changed (single quotes, spaces)", () => {
    const css = 'body { background-image:url ( \'http://example.com/bg.jpg\' ); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it('Multiple full urls are not changed', () => {
    const css = "body { background-image:url(http://example.com/bg.jpg); }\ndiv.main { background-image:url ( 'https://www.anothersite.com/another.png' ); }";
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Http url isn't changed", function() {
    const css = 'body { background-image:url(http://example.com/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Https url isn't changed", function() {
    const css = 'body { background-image:url(https://example.com/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("HTTPS url isn't changed", function() {
    const css = 'body { background-image:url(HTTPS://example.com/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("File url isn't changed", function() {
    const css = 'body { background-image:url(file:///example.com/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Double slash url isn't changed", function() {
    const css = 'body { background-image:url(//example.com/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Image data uri url isn't changed", function() {
    const css = 'body { background-image:url(data:image/png;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg==); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Font data uri url isn't changed", function() {
    const css = 'body { background-image:url(data:application/x-font-woff;charset=utf-8;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it('Relative url with dot slash', function() {
    const css = 'body { background-image:url(./c/d/bg.jpg); }';
    const expected = "body { background-image:url('foo/c/d/bg.jpg'); }";
    expect(fixupCSSUrls('foo/bar', css)).toBe(expected);
  });

  it('Multiple relative urls', function() {
    const css = 'body { background-image:URL ( "./bg.jpg" ); }\ndiv.main { background-image:url(../c/d/bg.jpg); }';
    const expected = "body { background-image:url('foo/bg.jpg'); }\ndiv.main { background-image:url('c/d/bg.jpg'); }";
    expect(fixupCSSUrls('foo/bar', css)).toBe(expected);
  });

  it("url with hash isn't changed", function() {
    const css = 'body { background-image:url(#bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it('Empty url should be skipped', function() {
    let css = 'body { background-image:url(); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url( ); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(\n); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(\'\'); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(\' \'); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(""); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(" "); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Rooted url isn't changed", function() {
    let css = 'body { background-image:url(/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
    css = 'body { background-image:url(/a/b/bg.jpg); }';
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });

  it("Doesn't break inline SVG", function() {
    const css = "body { background-image:url('data:image/svg+xml;charset=utf-8,<svg><feFlood flood-color=\"rgba(0,0,0,0.5)\" /></svg>'); }";
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });
  it("Doesn't break inline SVG with HTML comment", function() {
    const css = "body { background-image:url('data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Comment%20--%3E%0A%3Csvg%3E%3C%2Fsvg%3E%0A'); }";
    expect(fixupCSSUrls('foo/bar', css)).toBe(css);
  });
});
