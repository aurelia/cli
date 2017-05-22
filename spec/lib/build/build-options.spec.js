'use strict';

const BuildOptions = require('../../../lib/build/build-options').BuildOptions;
const CLIOptionsMock = require('../../mocks/cli-options');

describe('the BuildOptions module', () => {
  let cliOptionsMock;

  beforeEach(() => {
    cliOptionsMock = new CLIOptionsMock();
    cliOptionsMock.attach();
  });

  afterEach(() => {
    cliOptionsMock.detach();
  });

  it('overrides default options with customized options', () => {
    let buildOptions = new BuildOptions({ fromString: true }, { fromString: false });
    expect(buildOptions.getAllOptions().fromString).toBe(true);
  });

  describe('the getAllOptions() function', () => {
    it('returns the entire options object', () => {
      let options = {
        rev: 'dev & prod',
        minify: true
      };
      let buildOptions = new BuildOptions({}, options);
      expect(buildOptions.getAllOptions()).toEqual(options);
    });
  });

  describe('the getValue() function', () => {
    it('supports multi level options', () => {
      let options = new BuildOptions({}, { foo: { bar: { value: 'someValue' } } }, 'dev');
      expect(options.getValue('foo.bar').value).toBe('someValue');

      options = new BuildOptions({}, { foo: { bar: { value: { options: true } } } }, 'dev');
      expect(options.getValue('foo.bar').value.options).toBe(true);

      options = new BuildOptions({}, { foo: { bar: 'abcd' } }, 'dev');
      expect(options.getValue('foo.bar')).toBe('abcd');
    });

    it('supports one level options', () => {
      let options = new BuildOptions({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foo')).toBe('someValue');
    });

    it('returns undefined when property is not defined', () => {
      let options = new BuildOptions({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foobarbaz')).toBe(undefined);

      options = new BuildOptions({}, { foo: 'someValue' }, 'dev');
      expect(options.getValue('foo.bar.baz')).toBe(undefined);

      options = new BuildOptions({}, { }, 'dev');
      expect(options.getValue('foo.bar.baz')).toBe(undefined);
    });
  });

  describe('the isApplicable', () => {
    it('supports multi level options', () => {
      let options = new BuildOptions({}, { foo: { bar: { env: 'dev & prod' } } }, 'dev');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new BuildOptions({}, { foo: { bar: { env: 'dev & prod' } } }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(false);

      options = new BuildOptions({}, { foo: { bar: { env: true } } }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(true);

      options = new BuildOptions({}, { foo: { bar: { env: false } } }, 'staging');
      expect(options.isApplicable('foo.bar')).toBe(false);
    });

    it('returns false if env not found', () => {
      let options = new BuildOptions({}, { foo: { bar: { } } }, 'dev');
      expect(options.isApplicable('foo.bar')).toBe(false);
    });

    it('supports first level options', () => {
      let options = new BuildOptions({}, { foo: { env: 'dev & prod' } }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new BuildOptions({}, { foo: { env: 'dev & prod' } }, 'staging');
      expect(options.isApplicable('foo')).toBe(false);
    });

    it('interprets strings', () => {
      let options = new BuildOptions({}, { foo: 'dev & prod' }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new BuildOptions({}, { foo: { bar: { baz: 'dev & prod' } } }, 'dev');
      expect(options.isApplicable('foo.bar.baz')).toBe(true);

      options = new BuildOptions({}, { foo: 'dev & prod' }, 'staging');
      expect(options.isApplicable('foo')).toBe(false);

      options = new BuildOptions({}, { foo: { bar: { baz: 'dev & prod' } } }, 'staging');
      expect(options.isApplicable('foo.bar.baz')).toBe(false);
    });

    it('supports booleans', () => {
      let options = new BuildOptions({}, { foo: true }, 'dev');
      expect(options.isApplicable('foo')).toBe(true);

      options = new BuildOptions({}, { foo: false }, 'dev');
      expect(options.isApplicable('foo')).toBe(false);
    });
  });
});
