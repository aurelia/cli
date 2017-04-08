'use strict';

const Normalize = require('../../../../../lib/build/amodro-trace/lib/normalize');

describe('the amodro-trace normalize module', () => {
  describe('the module id normalizer', () => {
    it('strips slash from the end of a module id', () => {
      expect(Normalize.normalizeModuleId('some-module-id/')).toBe('some-module-id');
    });

    it('strips .js from the end of a module id', () => {
      expect(Normalize.normalizeModuleId('some-module-id.js')).toBe('some-module-id');
    });

    it('strips plugin loader prefix', () => {
      expect(Normalize.normalizeModuleId('text!some-module-id')).toBe('some-module-id');
    });

    it('returns moduleid if no normalization takes place', () => {
      expect(Normalize.normalizeModuleId('some-module-id')).toBe('some-module-id');
    });
  });
});
