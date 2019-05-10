const stubModule = require('../../../lib/build/stub-module');

describe('StubCoreNodejsModule', () => {
  it('stubs some core module with subfix -browserify', () => {
    expect(stubModule('os', 'src')).toEqual({
      name: 'os',
      path: '../node_modules/os-browserify'
    });
  });

  it('ignores sys', () => {
    expect(stubModule('sys', 'src')).toBeUndefined();
  });

  it('stubs empty module for some core module', () => {
    expect(stubModule('fs', 'src')).toBe('define(function(){});');
  });
});
