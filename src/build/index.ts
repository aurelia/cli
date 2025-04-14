import { Transform, type TransformCallback } from 'node:stream';
import { Bundler } from './bundler';
import { PackageAnalyzer } from './package-analyzer';
import { PackageInstaller } from './package-installer';
import { cacheDir } from './utils';
import * as fs from 'node:fs';
import { type Project } from '../project';

let bundler: Bundler | undefined;
let project: Project | undefined;
let isUpdating = false;

export async function src(p: Project) {
  if (bundler) {
    isUpdating = true;
    return Promise.resolve(bundler);
  }

  project = p;
  const b = await Bundler.create(
    project,
    new PackageAnalyzer(project),
    new PackageInstaller(project)
  );
  return bundler = b;
};

export async function createLoaderCode(p?: Project) {
  const createLoaderCode = require('./loader').createLoaderCode;
  project = p || project;
  await buildLoaderConfig(project);
  const platform = project.build.targets[0];
  return createLoaderCode(platform, bundler);
};

export async function createLoaderConfig(p?: Project) {
  const createLoaderConfig = require('/loader').createLoaderConfig;
  project = p || project;

  await buildLoaderConfig(project);
  const platform = project.build.targets[0];
  return createLoaderConfig(platform, bundler);
};

export function bundle() {
  return new Transform({
    objectMode: true,
    transform: function(file: IFile, encoding: BufferEncoding, callback: TransformCallback) {
      callback(null, capture(file));
    }
  });
};

export function dest(opts) {
  return bundler.build(opts)
    .then(() => bundler.write());
};

export function clearCache() {
  // delete cache folder outside of cwd
  return fs.promises.rm(cacheDir, { recursive: true, force: true });
};

async function buildLoaderConfig(p: Project) {
  project = p || project;
  let configPromise = Promise.resolve();

  if (!bundler) {
    //If a bundler doesn't exist then chances are we have not run through getting all the files, and therefore the "bundles" will not be complete
    configPromise = configPromise.then(() => {
      return Bundler.create(
        project,
        new PackageAnalyzer(project),
        new PackageInstaller(project)
      ).then(b => { bundler = b });
    });
  }

  await configPromise;
  return bundler.build();
}

function capture(file: IFile) {
  // ignore type declaration file generated by TypeScript compiler
  if (file.path.endsWith('d.ts')) return;

  if (isUpdating) {
    bundler.updateFile(file);
  } else {
    bundler.addFile(file);
  }
}
