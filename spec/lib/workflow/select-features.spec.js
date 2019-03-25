const selectFeatures = require('../../../lib/workflow/select-features');

describe('The selectFeatures for app project', () => {
  describe('in unattended mode', () => {
    it('sets default esnext features', async() => {
      const result = await selectFeatures(undefined, {unattended: true});
      expect(result).toEqual(['webpack', 'http1', 'web', 'babel', 'scaffold-minimum']);
    });

    it('sets features with overwrite on typescript', async() => {
      const result = await selectFeatures(['typescript'], {unattended: true});
      expect(result).toEqual(['webpack', 'http1', 'web', 'typescript', 'scaffold-minimum']);
    });

    it('sets features with overwrite on bundler', async() => {
      const result = await selectFeatures(['typescript', 'cli-bundler'], {unattended: true});
      expect(result).toEqual(['cli-bundler', 'requirejs', 'web', 'typescript', 'scaffold-minimum']);
    });

    it('sets features with overwrite on bundler and loader', async() => {
      const result = await selectFeatures(['typescript', 'cli-bundler', 'alameda'], {unattended: true});
      expect(result).toEqual(['cli-bundler', 'alameda', 'web', 'typescript', 'scaffold-minimum']);
    });

    it('sets features with conflicting overwrites, only honour the last choice', async() => {
      const result = await selectFeatures(['webpack', 'cli-bundler'], {unattended: true});
      expect(result).toEqual(['cli-bundler', 'requirejs', 'web', 'babel', 'scaffold-minimum']);
    });

    it('sets features with conflicting overwrites, only honour the last choice', async() => {
      const result = await selectFeatures(['webpack', 'alameda', 'systemjs', 'cli-bundler'], {unattended: true});
      expect(result).toEqual(['cli-bundler', 'systemjs', 'web', 'babel', 'scaffold-minimum']);
    });

    it('sets features with multiple overwrites', async() => {
      const result = await selectFeatures([
        'postcss-basic',
        'sass',
        'karma',
        'htmlmin-min',
        'cli-bundler',
        'vscode',
        'scaffold-navigation'
      ], {unattended: true});
      expect(result).toEqual([
        'cli-bundler',
        'requirejs',
        'web',
        'babel',
        'htmlmin-min',
        'sass',
        'postcss-basic',
        'karma',
        'vscode',
        'scaffold-navigation'
      ]);
    });
  });

  describe('in interactive mode (very slow tests, due to delays for reliable results)', () => {
    it('gets default esnext features', async() => {
      const result = await selectFeatures(undefined, {}, [
        1  // default esnext app
      ]);

      expect(result).toEqual(['webpack', 'http1', 'web', 'babel', 'jest', 'vscode', 'scaffold-minimum']);
    });

    it('gets default typescript features', async() => {
      const result = await selectFeatures(undefined, {}, [
        2  // default typescript app
      ]);

      expect(result).toEqual(['webpack', 'http1', 'web', 'typescript', 'jest', 'vscode', 'scaffold-minimum']);
    });

    // This is slow
    it('gets customised features', async() => {
      const result = await selectFeatures(undefined, {}, [
        3, // custom app
        1, // webpack
        2, // http2
        2, // dotnet-core
        1, // babel
        2, // htmlmin-min
        4, // stylus
        3, // postcss-typical
        2, // karma
        3, // cypress
        1, // no editor
        2  // scaffold-navigation
      ]);

      expect(result).toEqual([
        'webpack',
        'http2',
        'dotnet-core',
        'babel',
        'htmlmin-min',
        'stylus',
        'postcss-typical',
        'karma',
        'cypress',
        'scaffold-navigation'
      ]);
    });

    it('gets customised features (cli bundler)', async() => {
      const result = await selectFeatures(undefined, {}, [
        3, // custom app
        2, // cli-bundler
        2, // alameda
        1, // '' (web)
        2, // typescript
        1, // no htmlmin
        2, // less
        2, // postcss-basic
        1, // no unit test
        2, // protractor
        1, // no editor
        1  // scaffold-minimum
      ]);

      expect(result).toEqual([
        'cli-bundler',
        'alameda',
        'web',
        'typescript',
        'less',
        'postcss-basic',
        'protractor',
        'scaffold-minimum'
      ]);
    });

    it('gets all default customised features', async() => {
      const result = await selectFeatures(undefined, {}, [
        3, // custom app
        1, // webpack
        1, // http1
        1, // '' (web)
        1, // babel
        1, // no htmlmin
        1, // '' (css)
        1, // no postcss
        1, // no unit test
        1, // no e2e test
        1, // no editor
        1  // scaffold-minimum
      ]);

      expect(result).toEqual(['webpack', 'http1', 'web', 'babel', 'scaffold-minimum']);
    });

    it('gets customised features with overwrites that skips some questions', async() => {
      const result = await selectFeatures(['webpack', 'http2', 'stylus', 'karma', 'cypress'], {}, [
        // First workflow question is skipped
        2, // dotnet-core
        1, // babel
        2, // htmlmin-min
        3, // postcss-typical
        2, // vscode
        2  // scaffold-navigation
      ]);

      expect(result).toEqual([
        'webpack',
        'http2',
        'dotnet-core',
        'babel',
        'htmlmin-min',
        'stylus',
        'postcss-typical',
        'karma',
        'cypress',
        'vscode',
        'scaffold-navigation'
      ]);
    });
  });
});

describe('The selectFeatures for plugin project', () => {
  // TODO
});
