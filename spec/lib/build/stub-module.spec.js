const stubModule = require('../../../lib/build/stub-module');

describe('StubCoreNodejsModule', () => {
  it('stubs some core module with subfix -browserify', () => {
    expect(stubModule('os', 'src')).toEqual({
      name: 'os',
      path: '../node_modules/os-browserify'
    });
  });

  it('stubs domain', () => {
    expect(stubModule('domain', 'src')).toEqual({
      name: 'domain',
      path: '../node_modules/domain-browser'
    });
  });

  it('stubs http', () => {
    expect(stubModule('http', 'src')).toEqual({
      name: 'http',
      path: '../node_modules/stream-http'
    });
  });

  it('stubs querystring', () => {
    expect(stubModule('querystring', 'src')).toEqual({
      name: 'querystring',
      path: '../node_modules/querystring-browser-stub'
    });
  });

  it('stubs fs', () => {
    expect(stubModule('fs', 'src')).toEqual({
      name: 'fs',
      path: '../node_modules/fs-browser-stub'
    });
  });

  it('ignores sys', () => {
    expect(stubModule('sys', 'src')).toBeUndefined();
  });

  it('stubModule stubs zlib', () => {
    expect(stubModule('zlib', 'src')).toEqual({
      name: 'zlib',
      path: '../node_modules/browserify-zlib'
    });
  });

  it('stubs empty module for some core module', () => {
    expect(stubModule('dns', 'src')).toBe('define(function(){return {};});');
  });

  it('stubs empty module for __ignore__', () => {
    expect(stubModule('__ignore__', 'src')).toBe('define(function(){return {};});');
  });
});
