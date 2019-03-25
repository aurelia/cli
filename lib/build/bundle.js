const path = require('path');
const os = require('os');
const Terser = require('terser');
const Convert = require('convert-source-map');
const fs = require('../file-system');
const SourceInclusion = require('./source-inclusion').SourceInclusion;
const DependencyInclusion = require('./dependency-inclusion').DependencyInclusion;
const Configuration = require('../configuration').Configuration;
const Utils = require('./utils');
const logger = require('aurelia-logging').getLogger('Bundle');

exports.Bundle = class {
  constructor(bundler, config) {
    this.Minimatch = require('minimatch').Minimatch; //nested dep of vinyl-fs
    this.bundler = bundler;
    this.config = config;
    this.dependencies = [];
    this.prepend = (config.prepend || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.append = (config.append || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.moduleId = config.name.replace(path.extname(config.name), '');
    this.hash = '';
    this.includes = (config.source || []);
    this.excludes = [];
    this.aliases = {};
    if (this.includes instanceof Array) {
      this.includes = this.includes.map(x => new SourceInclusion(this, x));
    } else {
      this.excludes = (this.includes.exclude || []).map(x => this.createMatcher(x));
      this.includes = this.includes.include.map(x => new SourceInclusion(this, x));
    }
    this.buildOptions = new Configuration(config.options, bundler.buildOptions.getAllOptions());
    this.requiresBuild = true;
    this.fileCache = {};
  }

  static create(bundler, config) {
    let bundle = new exports.Bundle(bundler, config);
    let dependencies = config.dependencies || [];
    // ignore dep config with main:false
    // main:false support has been removed in auto-tracing
    let dependenciesToBuild = dependencies
      .filter(x => bundler.itemIncludedInBuild(x) && x.main !== false);

    return Utils.runSequentially(
      dependenciesToBuild,
      dep => bundler.configureDependency(dep))
      .then(descriptions => {
        return Utils.runSequentially(
          descriptions,
          description => {
            logger.info(`Manually adding ${description.banner}`);
            return bundle.addDependency(description);
          }
        );
      })
      .then(() => bundle);
  }

  createMatcher(pattern) {
    return new this.Minimatch(pattern, {
      dot: true
    });
  }

  addAlias(fromId, toId) {
    this.aliases[fromId] = toId;
  }

  addDependency(description) {
    this.dependencies.push(description);
    let inclusion = new DependencyInclusion(this, description);
    this.includes.push(inclusion);
    return inclusion.traceResources().then(() => inclusion);
  }

  trySubsume(item) {
    let includes = this.includes;

    for (let i = 0, ii = includes.length; i < ii; ++i) {
      if (includes[i].trySubsume(item)) {
        this.requiresBuild = true;
        return true;
      }
    }

    return false;
  }

  getDependencyInclusions() {
    return this.includes.filter(inclusion => inclusion instanceof DependencyInclusion);
  }

  getAliases() {
    let aliases = Object.assign({}, this.aliases);

    this.includes.forEach(inclusion => {
      if (inclusion.conventionalAliases) {
        Object.assign(aliases, inclusion.conventionalAliases());
      }
    });

    return aliases;
  }

  getRawBundledModuleIds() {
    let allModuleIds = new Set(this.includes.reduce((a, b) => a.concat(b.getAllModuleIds()), []));
    Object.keys(this.getAliases()).forEach(d => allModuleIds.add(d));
    return allModuleIds;
  }

  getBundledModuleIds() {
    let allModuleIds = this.getRawBundledModuleIds();
    let allIds = [];
    Array.from(allModuleIds).sort().forEach(id => {
      let matchingPlugin = this.bundler.loaderOptions.plugins.find(p => p.matches(id));
      if (matchingPlugin) {
        // make sure text! prefix is added, requirejs needs full form.
        // http://requirejs.org/docs/api.html#config-bundles
        allIds.push(matchingPlugin.createModuleId(id));
      } else if (id.endsWith('.json')) {
        allIds.push(Utils.moduleIdWithPlugin(id, 'text', this.bundler.loaderOptions.type));
        allIds.push(id);
        // be nice to requirejs json plugin users, add json! prefix
        allIds.push(Utils.moduleIdWithPlugin(id, 'json', this.bundler.loaderOptions.type));
      } else {
        allIds.push(id);
      }
    });

    return allIds;
  }

  getBundledFiles() {
    // Sort files by moduleId and deps to be sure they will always be
    // concatenated in the same order, so revision hash won't change.
    // https://github.com/aurelia/cli/issues/955#issuecomment-439253048
    // Topological sort for shim packages.

    let bundleFiles = uniqueBy(
      this.includes.reduce((a, b) => a.concat(b.getAllFiles()), []),
      file => file.path
    ).sort((a, b) => {
      // alphabetical sorting based on moduleId
      if (a.moduleId > b.moduleId) return 1;
      if (b.moduleId > a.moduleId) return -1;
      return 0;
    });

    const sorted = [];
    const visited = {};

    const visit = file => {
      const {moduleId, dependencyInclusion} = file;
      if (visited[moduleId]) return;
      visited[moduleId] = true;

      if (dependencyInclusion) {
        const {deps} = dependencyInclusion.description.loaderConfig;
        if (deps) {
          deps.forEach(packageName => {
            bundleFiles.filter(f =>
              f.dependencyInclusion && f.dependencyInclusion.description.name === packageName
            ).forEach(visit);
          });
        }
      }

      sorted.push(file);
    };

    bundleFiles.forEach(visit);

    // Special treatment for jquery and moment, put them in front of everything else,
    // so that jquery and moment can create global vars as early as possible.
    // This improves compatibility with some legacy jquery plugins.
    // Note as of momentjs version 2.10.0, momentjs no longer exports global object
    // in AMD module environment. There is special code in lib/build/amodro-trace/write/defines.js
    // to bring up global var "moment".
    const special = [];
    while (true) { // eslint-disable-line no-constant-condition
      const idx = sorted.findIndex(f => f.dependencyInclusion && (
        f.dependencyInclusion.description.name === 'jquery' ||
        f.dependencyInclusion.description.name === 'moment'));

      if (idx === -1) break;
      special.push(...sorted.splice(idx, 1));
    }

    return [...special, ...sorted];
  }

  write(platform) {
    if (!this.requiresBuild) {
      return Promise.resolve();
    }

    let work = Promise.resolve();
    let loaderOptions = this.bundler.loaderOptions;
    let buildOptions = this.buildOptions;
    let files = [];

    if (this.prepend.length) {
      work = work.then(() => addFilesInOrder(this, this.prepend, files));
    }

    if (loaderOptions.configTarget === this.config.name) {
      work = work.then(() => {
        // create global var "global" for compatibility with nodejs
        files.push({ contents: 'var global = this; _aureliaConfigureModuleLoader();'});
      });
    }

    let bundleFiles = this.getBundledFiles();

    // If file like jquery does AMD define by itself: define('jquery', ...),
    // which bypass writeTransform lib/build/amodro-trace/write/defines,
    // alias created by dependency-inclusion on jquey main file:
    // define('jquery', ['jquery/dist/jquery'], ...) will be ignored.
    // That is how requirejs/Dojo works, if you define same module twice,
    // second definition is ignored.
    // But systemjs implemented AMD not following requirejs/Dojo behaviour,
    // with systemjs, second definition overwrites first one.

    if (loaderOptions.type !== 'system') {
      work = work.then(() => files = files.concat(bundleFiles));
    }

    let aliases = this.getAliases();
    if (Object.keys(aliases).length) {
      // a virtual prepend file contains nodejs module aliases
      // for instance:
      // define('foo/bar', ['foo/bar/index'], function(m) { return m; });
      // define('foo/bar.js', ['foo/bar'], function(m) { return m; });

      const allAliases = Object.keys(aliases).sort().map(fromId => {
        let fromModuleId = fromId;
        let toModuleId = aliases[fromId];

        let matchingPlugin = this.bundler.loaderOptions.plugins.find(p => p.matches(fromId));
        if (matchingPlugin) {
          fromModuleId = matchingPlugin.createModuleId(fromModuleId);
          toModuleId = matchingPlugin.createModuleId(toModuleId);
        }

        return `define('${fromModuleId}',['${toModuleId}'],function(m){return m;});`;
      }).join('\n');

      work = work.then(() => {
        files.push({ contents: allAliases});
      });
    }

    if (loaderOptions.type === 'system') {
      work = work.then(() => files = files.concat(bundleFiles));
    }

    if (this.append.length) {
      work = work.then(() => addFilesInOrder(this, this.append, files));
    }

    return work.then(() => {
      const Concat = require('concat-with-sourcemaps');
      let concat = new Concat(true, this.config.name, ';' + os.EOL);
      const generateHashedPath = require('./utils').generateHashedPath;
      const generateHash = require('./utils').generateHash;
      let needsSourceMap = false;

      for (let i = 0; i < files.length; ++i) {
        let currentFile = files[i];
        let sourceMapEnabled = buildOptions.isApplicable('sourcemaps');
        let sourceMap = sourceMapEnabled ? currentFile.sourceMap : undefined;

        function fileIsDependency(file) {
          return file
            && file.path
            && file.path.indexOf('node_modules') >= 0;
        }

        function acquireSourceMapForDependency(file) {
          if (!file || !file.path) {
            return;
          }

          let parsedPath = path.parse(file.path);

          try {
            let base64SourceMap = Convert.fromSource(file.contents.toString());

            if (base64SourceMap) {
              return null;
            }
          } catch (error) {
            // we don't want the build to fail when a sourcemap file can't be parsed
            return null;
          }

          let converter;

          try {
            converter = Convert.fromMapFileSource(file.contents.toString(), parsedPath.dir);
          } catch (e) {
            logger.error(e);
            return null;
          }

          sourceMap = converter
            ? converter.sourcemap
            : null;

          if (sourceMap !== null) {
            let sourceRoot = parsedPath.dir.slice(process.cwd().length);
            sourceMap.sourceRoot = sourceRoot.replace(/\\/g, '\/');
          }

          return sourceMap;
        }

        let content = currentFile.contents;

        if (sourceMapEnabled) {
          if (fileIsDependency(currentFile)) {
            sourceMap = acquireSourceMapForDependency(currentFile);
          }

          if (sourceMap) {
            needsSourceMap = true;
            content = Convert.removeMapFileComments(currentFile.contents);
          }
        }
        concat.add(currentFile.path, content, sourceMap ? JSON.stringify(sourceMap) : undefined);
      }

      let mapContents;
      let contents = concat.content;
      let bundleFileName = this.config.name;

      if (loaderOptions.configTarget === this.config.name) {
        //Add to the config bundle the loader config. Can't change index.html yet because we haven't generated hashes for all the files
        concat.add(undefined, this.writeLoaderCode(platform));
        contents = concat.content;

        if (buildOptions.isApplicable('rev')) {
          //Generate a unique hash based off of the bundle contents
          //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
          this.hash = generateHash(concat.content).slice(0, 10);
          bundleFileName = generateHashedPath(this.config.name, this.hash);
        }
      } else if (buildOptions.isApplicable('rev')) {
        //Generate a unique hash based off of the bundle contents
        //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
        this.hash = generateHash(concat.content).slice(0, 10);
        bundleFileName = generateHashedPath(this.config.name, this.hash);
      }

      let mapFileName = bundleFileName + '.map';
      let mapSourceRoot = path.posix.relative(
        path.posix.join(process.cwd(), platform.output),
        process.cwd()
      );

      logger.info(`Writing ${bundleFileName}...`);

      if (buildOptions.isApplicable('bundleReport')) {
        let sbuffer = [];
        let jsonRep = {};

        sbuffer.push('>> ' + bundleFileName + ' total size : ' + (contents.length / 1024).toFixed(2) + 'kb, containing ' + files.length + ' files');
        let sortedFiles = files.sort((a, b) => {
          if (a.contents.length > b.contents.length) {
            return -1;
          }
          if (a.contents.length < b.contents.length) {
            return 1;
          }
          return 0;
        });
        for (let i = 0; i < sortedFiles.length; ++i) {
          let currentFile = sortedFiles[i];
          sbuffer.push('> ' + (currentFile.contents.length / 1024).toFixed(2) + 'kb (' + ((currentFile.contents.length / contents.length) * 100).toFixed(2) + '%) - ' + (currentFile.path || currentFile.contents.slice(0, 200)));
          if (currentFile.path) {
            jsonRep[currentFile.path] = jsonRep[currentFile.path] || {};
            jsonRep[currentFile.path].file = currentFile.path;
            jsonRep[currentFile.path].filesize = (currentFile.contents.length / 1024).toFixed(2);
          }
        }

        logger.info(`Writing bundle reports for ${bundleFileName}...`);
        fs.writeFile(`bundle-report-${bundleFileName}.txt`, sbuffer.join('\n'));
        fs.writeFile(`bundle-report-${bundleFileName}.json`, JSON.stringify(jsonRep, null, 2));
      }

      if (buildOptions.isApplicable('minify')) {
        // Terser fast minify mode
        // https://github.com/fabiosantoscode/terser#terser-fast-minify-mode
        // It's a good balance on size and speed to turn off compress.
        // Turn off compress also bypasses https://github.com/terser-js/terser/issues/120
        let minificationOptions = {compress: false};

        let minifyOptions = buildOptions.getValue('minify');
        if (typeof minifyOptions === 'object') {
          Object.assign(minificationOptions, minifyOptions);
        }

        if (needsSourceMap) {
          minificationOptions.sourceMap = {
            content: concat.sourceMap,
            filename: bundleFileName,
            url: mapFileName,
            root: mapSourceRoot
          };
        }

        let minificationResult = Terser.minify(String(contents), minificationOptions);
        if (minificationResult.error) throw minificationResult.error;

        contents = minificationResult.code;
        mapContents = needsSourceMap ? Convert.fromJSON(minificationResult.map).toJSON() : undefined;
      } else if (needsSourceMap) {
        mapContents = Convert.fromJSON(concat.sourceMap)
          .setProperty('sourceRoot', mapSourceRoot)
          .toJSON();

        contents += os.EOL + '//# sourceMappingURL=' +  path.basename(mapFileName);
      }

      return fs.writeFile(path.posix.join(platform.output, bundleFileName), contents).then(() => {
        this.requiresBuild = false;

        if (mapContents) {
          return fs.writeFile(path.posix.join(platform.output, mapFileName), mapContents)
            .catch(e => {
              logger.error(`Unable to write the sourcemap to ${path.posix.join(platform.output, mapFileName)}`);
            });
        }
      }).catch(e => {
        logger.error(`Unable to write the bundle to ${path.posix.join(platform.output, bundleFileName)}`);
        logger.info(e);
        throw e;
      });
    }).catch(e => {
      logger.error('Failed to write the bundle');
      logger.info(e);
      throw e;
    });
  }

  getFileFromCacheOrLoad(x) {
    let found = this.fileCache[x];
    if (found) {
      return Promise.resolve(found);
    }

    return fs.readFile(x).then(data => {
      found = { contents: data.toString(), path: x };
      this.fileCache[x] = found;
      return found;
    }).catch(e => {
      logger.error(`Error while trying to read ${x}`);
      throw e;
    });
  }

  writeLoaderCode(platform) {
    const createLoaderCode = require('./loader').createLoaderCode;
    let config = createLoaderCode(platform, this.bundler);

    return 'function _aureliaConfigureModuleLoader(){' + config + '}';
  }

  async writeBundlePathsToIndex(platform) {
    try {
      if (!platform.index) {
        return;
      }

      const indexFile = fs.readFileSync(platform.index);
      const outputDir = platform.baseUrl || platform.output;
      const configMatcher = Utils.createSrcFileRegex(outputDir, this.moduleId);
      const bundleFileName = this.hash ? Utils.generateHashedPath(this.config.name, this.hash) : this.config.name;
      const bundleLocation = path.posix.join(outputDir, bundleFileName);
      // Replace file name with hashed file name
      if (configMatcher.test(indexFile)) {
        const newIndexFile = indexFile.replace(configMatcher, 'src="$2' + bundleLocation + '"');
        if (newIndexFile !== indexFile) {
          await fs.writeFile(platform.index, newIndexFile);
          logger.info(`Updated file name for ${bundleFileName} in ${platform.index}`);
        }
      }
    } catch (error) {
      logger.error(`Couldn't update file name with revision in ${platform.index}`, error);
    }
  }
};

function addFilesInOrder(bundle, paths, files) {
  let index = -1;

  function addFile() {
    index++;

    if (index < paths.length) {
      return bundle.getFileFromCacheOrLoad(paths[index])
        .then(file => files.push(file))
        .then(addFile);
    }

    return Promise.resolve();
  }

  return addFile();
}

function uniqueBy(collection, key) {
  const seen = {};
  return collection.filter((item) => {
    const k = key(item);
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}
