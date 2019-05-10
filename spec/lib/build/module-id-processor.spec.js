const { toDotDot, fromDotDot, getAliases } = require('../../../lib/build/module-id-processor');

describe('module-id-processor', () => {
  const moduleId = '../src/elements/hello-world.ts';
  const escapedModuleId = '__dot_dot__/src/elements/hello-world.ts';
  const paths = {
    'resources': '../src',
    'elements': '../src/elements'
  };

  describe('toDotDot', () => {
    it('should replace ../ in module id', () => {
      expect(toDotDot(moduleId)).toEqual(escapedModuleId);
    });

    it('should replace multiple ../ in module id', () => {
      expect(toDotDot('../' + moduleId)).toEqual('__dot_dot__/' + escapedModuleId);
    });
  });

  describe('fromDotDot', () => {
    it('should convert moduleId to original path', () => {
      expect(fromDotDot(escapedModuleId)).toEqual(moduleId);
    });

    it('should replace multiple ../ in moduleId', () => {
      expect(fromDotDot('__dot_dot__/' + escapedModuleId)).toEqual('../' + moduleId);
    });
  });

  describe('getAliases', () => {
    it('should return a single match', () => {
      expect(getAliases('../src/hello-world.ts', paths)).toEqual([
        { fromId: 'resources/hello-world.ts', toId: '__dot_dot__/src/hello-world.ts' }
      ]);
    });

    it('should return an empty array when no match is found', () => {
      expect(getAliases('no/match/hello-world.ts', paths)).toEqual([]);
    });

    it('should return multiple matches', () => {
      expect(getAliases(moduleId, paths)).toEqual([
        { fromId: 'resources/elements/hello-world.ts', toId: '__dot_dot__/src/elements/hello-world.ts' },
        { fromId: 'elements/hello-world.ts', toId: '__dot_dot__/src/elements/hello-world.ts' }
      ]);
    });

    it('should support different aliases with same paths', () => {
      const duplicatePaths = {
        ...paths,
        '@resources': '../src'
      };

      expect(getAliases(moduleId, duplicatePaths)).toEqual([
        { fromId: 'resources/elements/hello-world.ts', toId: '__dot_dot__/src/elements/hello-world.ts' },
        { fromId: 'elements/hello-world.ts', toId: '__dot_dot__/src/elements/hello-world.ts' },
        { fromId: '@resources/elements/hello-world.ts', toId: '__dot_dot__/src/elements/hello-world.ts' }
      ]);
    });
  });
});
