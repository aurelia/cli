const stubModule = require('../../../dist/build/stub-module').stubModule;

describe('StubCoreNodejsModule', () => {
  it('stubs some core module with subfix -browserify', async () => {
    expect(await stubModule('os', 'src')).toEqual({
      name: 'os',
      path: '../node_modules/os-browserify'
    });
  });

  it('stubs domain', async () => {
    expect(await stubModule('domain', 'src')).toEqual({
      name: 'domain',
      path: '../node_modules/domain-browser'
    });
  });

  it('stubs http', async () => {
    expect(await stubModule('http', 'src')).toEqual({
      name: 'http',
      path: '../node_modules/stream-http'
    });
  });

  it('stubs querystring', async () => {
    expect(await stubModule('querystring', 'src')).toEqual({
      name: 'querystring',
      path: '../node_modules/querystring-browser-stub'
    });
  });

  it('stubs fs', async () => {
    expect(await stubModule('fs', 'src')).toEqual({
      name: 'fs',
      path: '../node_modules/fs-browser-stub'
    });
  });

  it('ignores sys', async () => {
    expect(await stubModule('sys', 'src')).toBeUndefined();
  });

  it('stubModule stubs zlib', async () => {
    expect(await stubModule('zlib', 'src')).toEqual({
      name: 'zlib',
      path: '../node_modules/browserify-zlib'
    });
  });

  it('stubs empty module for some core module', async () => {
    expect(await stubModule('dns', 'src')).toBe('define(function(){return {};});');
  });

  it('stubs empty module for __ignore__', async () => {
    expect(await stubModule('__ignore__', 'src')).toBe('define(function(){return {};});');
  });
});
