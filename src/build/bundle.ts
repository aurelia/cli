import { Configuration } from '../configuration';
import { Bundler } from './bundler';

import * as path from 'node:path';
import * as os from 'node:os';
import * as Terser from 'terser';
import * as Convert from 'convert-source-map';
import { Minimatch } from 'minimatch'
import * as fs from '../file-system';
import { SourceInclusion } from './source-inclusion';
import { DependencyInclusion } from './dependency-inclusion';
import * as Utils from './utils';
import { DependencyDescription } from './dependency-description';
import { getLogger } from 'aurelia-logging';
import { BundledSource } from './bundled-source';
const logger = getLogger('Bundle');


export class Bundle {
  public readonly bundler: Bundler;
  public readonly includes: (SourceInclusion | DependencyInclusion)[];
  public readonly excludes: Minimatch[];

  public requiresBuild: boolean;
  public readonly config: AureliaJson.IBundle;
  private readonly dependencies: DependencyDescription[]; // TODO: remove?
  private readonly prepend: string[];
  private readonly append: string[];
  public readonly moduleId: string;
  public hash: string;
  private readonly aliases: {[key: string]: string};
  private readonly buildOptions: Configuration;
  private readonly fileCache: {[key: string]: { contents: string, path: string }};

  private constructor(bundler: Bundler, config: AureliaJson.IBundle) {
    this.bundler = bundler;
    this.config = config;
    this.dependencies = [];
    this.prepend = (config.prepend || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.append = (config.append || []).filter(x => bundler.itemIncludedInBuild(x)).map(x => typeof x === 'string' ? x : x.path);
    this.moduleId = config.name.replace(path.extname(config.name), '');
    this.hash = '';
    
    this.aliases = {};

    const includes = (config.source || []);
    if (includes instanceof Array) {
      this.excludes = [];
      this.includes = includes.map(x => new SourceInclusion(this, x));
    } else {
      this.excludes = (includes.exclude || []).map(x => this.createMatcher(x));
      this.includes = includes.include.map(x => new SourceInclusion(this, x));
    }
    this.buildOptions = new Configuration(config.options, bundler.buildOptions.getAllOptions());
    this.requiresBuild = true;
    this.fileCache = {};
  }

  static async create(bundler: Bundler, config: AureliaJson.IBundle): Promise<Bundle> {
    const bundle = new Bundle(bundler, config);
    const dependencies = config.dependencies || [];
    // ignore dep config with main:false
    // main:false support has been removed in auto-tracing
    const dependenciesToBuild = dependencies
      .filter(x => bundler.itemIncludedInBuild(x) && (x as { main?: string | false}).main !== false);

    const descriptions = await Utils.runSequentially(
      dependenciesToBuild,
      dep => bundler.configureDependency(dep));
    await Utils.runSequentially(
      descriptions,
      description => {
        logger.info(`Manually adding ${description.banner}`);
        return bundle.addDependency(description);
      }
    );
    return bundle;
  }

  createMatcher(pattern: string) {
    return new Minimatch(pattern, {
      dot: true
    });
  }

  addAlias(fromId: string, toId: string) {
    this.aliases[fromId] = toId;
  }

  async addDependency(description: DependencyDescription) {
    this.dependencies.push(description);
    const inclusion = new DependencyInclusion(this, description);
    this.includes.push(inclusion);
    await inclusion.traceResources();
    return inclusion;
  }

  trySubsume(item: BundledSource) {
    const includes = this.includes;

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
    const aliases = Object.assign({}, this.aliases);

    this.includes.forEach(inclusion => {
      if (inclusion instanceof DependencyInclusion && inclusion.conventionalAliases) {
        Object.assign(aliases, inclusion.conventionalAliases());
      }
    });

    return aliases;
  }

  getRawBundledModuleIds() {
    const allModuleIds = new Set<string>(this.includes.reduce((a, b) => a.concat(b.getAllModuleIds()), []));
    Object.keys(this.getAliases()).forEach(d => allModuleIds.add(d));
    return allModuleIds;
  }

  getBundledModuleIds() {
    const allModuleIds = this.getRawBundledModuleIds();
    const allIds: string[] = [];
    Array.from(allModuleIds).sort().forEach(id => {
      const matchingPlugin = this.bundler.loaderOptions.plugins.find(p => p.matches(id));
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

    const bundleFiles = uniqueBy(
      this.includes.reduce<BundledSource[]>((a, b) => a.concat(b.getAllFiles()), []),
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
    while (true) {
      const idx = sorted.findIndex(f => f.dependencyInclusion && (
        f.dependencyInclusion.description.name === 'jquery' ||
        f.dependencyInclusion.description.name === 'moment'));

      if (idx === -1) break;
      special.push(...sorted.splice(idx, 1));
    }

    return [...special, ...sorted];
  }

  write(platform: AureliaJson.ITarget) {
    if (!this.requiresBuild) {
      return Promise.resolve();
    }

    let work = Promise.resolve();
    const loaderOptions = this.bundler.loaderOptions;
    const buildOptions = this.buildOptions;
    let files: IFile[] = [];

    if (this.prepend.length) {
      work = work.then(() => addFilesInOrder(this, this.prepend, files));
    }

    if (loaderOptions.configTarget === this.config.name) {
      work = work.then(() => {
        // create global var "global" for compatibility with nodejs
        files.push({ contents: 'var global = this; _aureliaConfigureModuleLoader();'});
      });
    }

    const bundleFiles = this.getBundledFiles();

    // If file like jquery does AMD define by itself: define('jquery', ...),
    // which bypass writeTransform lib/build/amodro-trace/write/defines,
    // alias created by dependency-inclusion on jquey main file:
    // define('jquery', ['jquery/dist/jquery'], ...) will be ignored.
    // That is how requirejs/Dojo works, if you define same module twice,
    // second definition is ignored.
    // But systemjs implemented AMD not following requirejs/Dojo behaviour,
    // with systemjs, second definition overwrites first one.

    if (loaderOptions.type !== 'system') {
      work = work.then(() => { files = files.concat(bundleFiles); });
    }

    const aliases = this.getAliases();
    if (Object.keys(aliases).length) {
      // a virtual prepend file contains nodejs module aliases
      // for instance:
      // define('foo/bar', ['foo/bar/index'], function(m) { return m; });
      // define('foo/bar.js', ['foo/bar'], function(m) { return m; });

      const allAliases = Object.keys(aliases).sort().map(fromId => {
        let fromModuleId = fromId;
        let toModuleId = aliases[fromId];

        const matchingPlugin = this.bundler.loaderOptions.plugins.find(p => p.matches(fromId));
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
      work = work.then(() => { files = files.concat(bundleFiles); });
    }

    if (this.append.length) {
      work = work.then(() => addFilesInOrder(this, this.append, files));
    }

    return work.then(async () => {
      const { default: Concat } = await import('concat-with-sourcemaps');
      const concat = new Concat(true, this.config.name, ';' + os.EOL);
      let needsSourceMap = false;

      for (let i = 0; i < files.length; ++i) {
        const currentFile = files[i];
        const sourceMapEnabled = buildOptions.isApplicable('sourcemaps');
        let sourceMap = sourceMapEnabled && currentFile.sourceMap ?
          JSON.parse(JSON.stringify(currentFile.sourceMap)) :
          undefined;
        const parsedPath = currentFile.path && path.parse(currentFile.path);

        function acquireSourceMapForDependency(file: IFile) {
          if (!file || !file.path) {
            return null;
          }

          try {
            const base64SourceMap = Convert.fromSource(file.contents.toString());

            if (base64SourceMap) {
              return null;
            }
          } catch {
            // we don't want the build to fail when a sourcemap file can't be parsed
            return null;
          }

          let converter: Convert.SourceMapConverter | null;

          try {
            converter = Convert.fromMapFileSource(file.contents.toString(), (filename) =>
              fs.readFileSync(path.resolve(parsedPath.dir, filename), 'utf-8')
            );
          } catch (e) {
            logger.error(e);
            return null;
          }

          sourceMap = converter
            ? converter.sourcemap
            : null;

          return sourceMap;
        }

        let content = currentFile.contents;

        if (sourceMapEnabled) {
          if (!sourceMap) {
            sourceMap = acquireSourceMapForDependency(currentFile);
          }

          if (sourceMap && parsedPath) {
            let sourceRoot = parsedPath.dir.slice(process.cwd().length + 1).replace(/\\/g, '/');
            if (!currentFile.dependencyInclusion) {
              // Deal with local source, only use first top folder.
              // Because gulp-babel/gulp-typescript already had rest of folder in sourceMap sources field.
              sourceRoot = sourceRoot.split('/', 1)[0];
            }
            sourceMap.sourceRoot = sourceRoot;
            needsSourceMap = true;
            content = Convert.removeMapFileComments(currentFile.contents);
          }

          if (sourceMap && !sourceMap.mappings) {
            // Need a dummy identity map.
            // Otherwise concat-with-sourcemaps is confused about source path.
            sourceMap.mappings = 'AAAA';
          }
        }


        concat.add(
          currentFile.path ? path.relative(process.cwd(), currentFile.path) : null,
          content,
          sourceMap && sourceMap.sources.length ? JSON.stringify(sourceMap) : undefined
        );
      }

      let bundleMap;
      let contents: string | Buffer<ArrayBufferLike> = concat.content;
      let bundleFileName = this.config.name;

      if (loaderOptions.configTarget === this.config.name) {
        //Add to the config bundle the loader config. Can't change index.html yet because we haven't generated hashes for all the files
        concat.add(undefined, await this.writeLoaderCode(platform));
        contents = concat.content;

        if (buildOptions.isApplicable('rev')) {
          //Generate a unique hash based off of the bundle contents
          //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
          this.hash = Utils.generateHash(concat.content).slice(0, 10);
          bundleFileName = Utils.generateHashedPath(this.config.name, this.hash);
        }
      } else if (buildOptions.isApplicable('rev')) {
        //Generate a unique hash based off of the bundle contents
        //Must generate hash after we write the loader config so that any other bundle changes (hash changes) can cause a new hash for the vendor file
        this.hash = Utils.generateHash(concat.content).slice(0, 10);
        bundleFileName = Utils.generateHashedPath(this.config.name, this.hash);
      }

      const mapFileName = bundleFileName + '.map';
      const mapSourceRoot = path.posix.relative(
        path.posix.join(process.cwd(), platform.output),
        process.cwd()
      );

      logger.info(`Writing ${bundleFileName}...`);

      if (buildOptions.isApplicable('bundleReport')) {
        const sbuffer = [];
        const jsonRep = {};

        sbuffer.push('>> ' + bundleFileName + ' total size : ' + (contents.length / 1024).toFixed(2) + 'kb, containing ' + files.length + ' files');
        const sortedFiles = files.sort((a, b) => {
          if (a.contents.length > b.contents.length) {
            return -1;
          }
          if (a.contents.length < b.contents.length) {
            return 1;
          }
          return 0;
        });
        for (let i = 0; i < sortedFiles.length; ++i) {
          const currentFile = sortedFiles[i];
          sbuffer.push('> ' + (currentFile.contents.length / 1024).toFixed(2) + 'kb (' + ((currentFile.contents.length / contents.length) * 100).toFixed(2) + '%) - ' + (currentFile.path || currentFile.contents.slice(0, 200)));
          if (currentFile.path) {
            jsonRep[currentFile.path] = jsonRep[currentFile.path] || {};
            jsonRep[currentFile.path].file = currentFile.path;
            jsonRep[currentFile.path].filesize = (currentFile.contents.length / 1024).toFixed(2);
          }
        }

        logger.info(`Writing bundle reports for ${bundleFileName}...`);
        await fs.writeFile(`bundle-report-${bundleFileName}.txt`, sbuffer.join('\n'));
        await fs.writeFile(`bundle-report-${bundleFileName}.json`, JSON.stringify(jsonRep, null, 2));
      }

      if (buildOptions.isApplicable('minify')) {
        // Terser fast minify mode
        // https://github.com/fabiosantoscode/terser#terser-fast-minify-mode
        // It's a good balance on size and speed to turn off compress.
        // Turn off compress also bypasses https://github.com/terser-js/terser/issues/120
        const minificationOptions: Terser.MinifyOptions = {compress: false};

        const minifyOptions = buildOptions.getValue('minify');
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

        const minificationResult = await Terser.minify(String(contents), minificationOptions);

        contents = minificationResult.code;
        if (needsSourceMap){
          if (typeof minificationResult.map !== 'string'){
            console.error('`minificationResult.map` should be string!', minificationOptions);
            throw new Error('`minificationResult.map` should be string!');
          }
          bundleMap = Convert.fromJSON(minificationResult.map).toObject();
        }
      } else if (needsSourceMap) {
        bundleMap = Convert.fromJSON(concat.sourceMap)
          .setProperty('sourceRoot', mapSourceRoot)
          .toObject();

        if (typeof contents !== 'string') {
          contents = contents.toString();
        }
        contents += os.EOL + '//# sourceMappingURL=' +  path.basename(mapFileName);
      }

      return fs.writeFile(path.posix.join(platform.output, bundleFileName), contents).then(async () => {
        this.requiresBuild = false;

        if (bundleMap) {
          const sourceRoot = bundleMap.sourceRoot;
          if (sourceRoot) {
            // Remove sourceRoot in order to be nicer to karma code coverage tool.
            delete bundleMap.sourceRoot;
            bundleMap.sources = bundleMap.sources.map(s => path.posix.join(sourceRoot, s));
          }
          try {
            return await fs.writeFile(path.posix.join(platform.output, mapFileName), JSON.stringify(bundleMap));
          } catch {
            logger.error(`Unable to write the sourcemap to ${path.posix.join(platform.output, mapFileName)}`);
          }
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

  async getFileFromCacheOrLoad(x: string) {
    let found = this.fileCache[x];
    if (found) {
      return found;
    }

    try {
      const data = await fs.readFile(x);
      found = { contents: data, path: x };
      this.fileCache[x] = found;
      return found;
    } catch (e) {
      logger.error(`Error while trying to read ${x}`);
      throw e;
    }
  }

  async writeLoaderCode(platform: AureliaJson.ITarget) {
    const createLoaderCode = (await import('./loader')).createLoaderCode;
    const config = createLoaderCode(platform, this.bundler);

    return 'function _aureliaConfigureModuleLoader(){' + config + '}';
  }

  async writeBundlePathsToIndex(platform: AureliaJson.ITarget) {
    try {
      if (!platform.index) {
        return;
      }

      const indexFile = fs.readFileSync(platform.index);
      const configMatcher = Utils.createBundleFileRegex(this.moduleId);
      const bundleFileName = this.hash ? Utils.generateHashedPath(this.config.name, this.hash) : this.config.name;
      // Replace file name with hashed file name
      if (configMatcher.test(indexFile)) {
        const newIndexFile = indexFile.replace(configMatcher, bundleFileName);
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

function addFilesInOrder(bundle: Bundle, paths: string[], files: IFile[]): Promise<void> {
  let index = -1;

  async function addFile(): Promise<void> {
    index++;

    if (index < paths.length) {
      const file = await bundle.getFileFromCacheOrLoad(paths[index]);
      files.push(file);
      return addFile();
    }

    return;
  }

  return addFile();
}

function uniqueBy<T>(collection: T[], key: (item: T) => PropertyKey) {
  const seen: Partial<{ [K in keyof T]: boolean}> = {};
  return collection.filter((item) => {
    const k = key(item);
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}
