const path = require('path');
const DependencyDescription = require('../../../lib/build/dependency-description').DependencyDescription;

describe('The DependencyDescription', () => {
  let sut;

  beforeEach(() => {
    sut = new DependencyDescription('foo', 'npm');
  });

  it('gets mainId, calculates main path', () => {
    sut.loaderConfig = {
      name: 'foo',
      path: '../node_modules/foo',
      main: 'dist/bar'};
    expect(sut.mainId).toBe('foo/dist/bar');
    expect(sut.calculateMainPath('src')).toBe(path.join(process.cwd(), 'node_modules/foo/dist/bar.js'));
  });

  it('gets empty browser replacement if no browser replacement defined', () => {
    sut.metadata = {};
    expect(sut.browserReplacement()).toBeUndefined();
    sut.metadata = {browser: 'dist/browser.js'};
    expect(sut.browserReplacement()).toBeUndefined();
  });

  it('gets browser replacement', () => {
    sut.metadata = {
      browser: {
        'module-a': false,
        'module/b': 'shims/module/b.js',
        './server/only.js': './shims/server-only.js'
      }
    };
    expect(sut.browserReplacement()).toEqual({
      'module-a': false,
      'module/b': './shims/module/b',
      './server/only': './shims/server-only'
    });
  });
});
