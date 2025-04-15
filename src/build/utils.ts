import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'crypto';
import * as fs from '../file-system';

const tmpDir = os.tmpdir();
export const knownExtensions = ['.js', '.cjs', '.mjs', '.json', '.css', '.svg', '.html'];

export function couldMissGulpPreprocess(id: string) {
  const ext = path.extname(id).toLowerCase();
  return ext && ext !== '.js' && ext !== '.html' && ext !== '.css';
};

async function getPackagePaths() {
  // require.resolve(packageName) cannot resolve package has no main.
  // for instance: font-awesome v4.7.0
  // manually try resolve paths
  return [
    // normal search from cli
    ...require.resolve.paths('not-core/'),
    // additional search from app's folder, this is necessary to support
    // lerna hoisting where cli is out of app's local node_modules folder.
    ...(await import('resolve/lib/node-modules-paths')).default(process.cwd(), {})
  ];
}

// resolve npm package path
export async function resolvePackagePath(packageName: string) {
  const packagePaths = await getPackagePaths();
  for (let i = 0, len = packagePaths.length; i < len; i++) {
    const dirname = path.join(packagePaths[i], packageName);
    if (fs.isDirectory(dirname)) return dirname;
  }

  throw new Error(`cannot resolve npm package folder for "${packageName}"`);
};

export function moduleIdWithPlugin(moduleId: string, pluginName: string, type: 'require' | 'system') {
  switch (type) {
  case 'require':
    return pluginName + '!' + moduleId;
  case 'system':
    return moduleId + '!' + pluginName;
  default:
    throw new Error(`Loader configuration style ${type} is not supported.`);
  }
};

const CACHE_DIR = path.resolve(tmpDir, 'aurelia-cli-cache');
export const cacheDir = CACHE_DIR;

function cachedFilePath(hash: string) {
  const folder = hash.slice(0, 2);
  const fileName = hash.slice(2);
  return path.resolve(CACHE_DIR, folder, fileName);
}

export function getCache(hash: string) {
  const filePath = cachedFilePath(hash);
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch {
    // ignore
  }
};

export function setCache(hash: string, object: unknown) {
  const filePath = cachedFilePath(hash);
  // async write
  fs.writeFileSync(filePath, JSON.stringify(object));
};

export async function runSequentially<T, U>(tasks: T[], cb: (task: T, index: number) => Promise<U>): Promise<U[]> {
  let index = -1;
  const result: U[] = [];

  async function exec() {
    index++;

    if (index < tasks.length) {
      const r = await cb(tasks[index], index);
      result.push(r);
      await exec();
    }
  }

  await exec();
  return result;
};

export function generateHashedPath(pth: string, hash: string) {
  if (arguments.length !== 2) {
    throw new Error('`path` and `hash` required');
  }

  return modifyFilename(pth, function(filename: string, ext: string) {
    return filename + '-' + hash + ext;
  });
};

export function revertHashedPath(pth: string, hash: string) {
  if (arguments.length !== 2) {
    throw new Error('`path` and `hash` required');
  }

  return modifyFilename(pth, function(filename: string, ext: string) {
    return filename.replace(new RegExp('-' + hash + '$'), '') + ext;
  });
};

export function generateHash(bufOrStr: crypto.BinaryLike) {
  return crypto.createHash('md5').update(bufOrStr).digest('hex');
};

export function escapeForRegex(str: string) {
  const matchers = /[|\\{}()[\]^$+*?.]/g;
  return str.replace(matchers, '\\$&');
};

export function createBundleFileRegex(bundleName: string) {
  return new RegExp(escapeForRegex(bundleName) + '[^"\']*?\\.js', 'g');
};

function modifyFilename(path: string, modifier: (filename: string, ext: string) => string): string;
function modifyFilename(path: string[], modifier: (filename: string, ext: string) => string): string[];
function modifyFilename(pth: string | string[], modifier: (filename: string, ext: string) => string): string | string[] {
  if (arguments.length !== 2) {
    throw new Error('`path` and `modifier` required');
  }

  if (Array.isArray(pth)) {
    return pth.map(function(el: string) {
      return modifyFilename(el, modifier);
    });
  }

  const ext = path.extname(pth);
  return path.posix.join(path.dirname(pth), modifier(path.basename(pth, ext), ext));
}

// https://nodejs.org/dist/latest-v10.x/docs/api/modules.html
// after "high-level algorithm in pseudocode of what require.resolve() does"
function nodejsLoadAsFile(resourcePath: string) {
  if (fs.isFile(resourcePath)) {
    return resourcePath;
  }

  if (fs.isFile(resourcePath + '.js')) {
    return resourcePath + '.js';
  }

  if (fs.isFile(resourcePath + '.json')) {
    return resourcePath + '.json';
  }
  // skip .node file that nobody uses
}

function nodejsLoadIndex(resourcePath: string) {
  if (!fs.isDirectory(resourcePath)) return;

  const indexJs = path.join(resourcePath, 'index.js');
  if (fs.isFile(indexJs)) {
    return indexJs;
  }

  const indexJson = path.join(resourcePath, 'index.json');
  if (fs.isFile(indexJson)) {
    return indexJson;
  }
  // skip index.node file that nobody uses
}

function nodejsLoadAsDirectory(resourcePath: string) {
  if (!fs.isDirectory(resourcePath)) return;

  const packageJson = path.join(resourcePath, 'package.json');

  if (fs.isFile(packageJson)) {
    let metadata;
    try {
      metadata = JSON.parse(fs.readFileSync(packageJson));
    } catch (err) {
      console.error(err);
      return;
    }
    let metaMain;
    // try 1.browser > 2.module > 3.main
    // the order is to target browser.
    // when aurelia-cli introduces multi-targets build,
    // it probably should use different order for electron app
    // for electron 1.module > 2.browser > 3.main
    if (typeof metadata.browser === 'string')  {
      // use package.json browser field if possible.
      metaMain = metadata.browser;
    } else if (typeof metadata.browser === 'object' && typeof metadata.browser['.'] === 'string') {
      // use package.json browser mapping {".": "dist/index.js"} if possible.
      metaMain = metadata.browser['.'];
    } else if (typeof metadata.module === 'string' &&
      !(metadata.name && metadata.name.startsWith('aurelia-'))) {
      // prefer es module format over cjs, just like webpack.
      // this improves compatibility with TypeScript.
      // ignores aurelia-* core npm packages as their module
      // field is pointing to es2015 folder.
      metaMain = metadata.module;
    } else if (typeof metadata.main === 'string') {
      metaMain = metadata.main;
    }

    const mainFile = metaMain || 'index';
    const mainResourcePath = path.resolve(resourcePath, mainFile);
    return nodejsLoadAsFile(mainResourcePath) || nodejsLoadIndex(mainResourcePath);
  }

  return nodejsLoadIndex(resourcePath);
}

export function nodejsLoad(resourcePath: string) {
  return nodejsLoadAsFile(resourcePath) || nodejsLoadAsDirectory(resourcePath);
};

export function removeJsExtension(filePath: string) {
  if (path.extname(filePath).toLowerCase() === '.js') {
    return filePath.slice(0, -3);
  }

  return filePath;
};

