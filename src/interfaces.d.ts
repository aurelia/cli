declare namespace AureliaJson {
  interface IProject {
    paths: IPaths;
    platform: IPlatform;
    transpiler: ITranspiler;
    markupProcessor: {
      source: string[];
    }
    cssProcessor: {
      source: string[];
    }
    jsonProcessor: {
      source: string[];
    }
    build: IBuild
  }

  interface IBuild {
    targets: ITarget[];
    options: IBuildOptions;
    bundles: IBundle[];
    loader: ILoader;
  }

  interface IPaths {
    root: string;
    resources: string;
    elements: string;
    attributes: string;
    valueConverters: string;
    bindingBehaviours: string;
  }

  interface IPlatform {
    port: number;
    host: string;
    open: false;
    index: string;
    baseDir: string;
    output: string;
  }

  interface ITranspiler {
    id: string;
    fileExtension: string;
  }

  interface ITarget {
    port: number;
    index: string;
    baseDir: string;
    output: string;
  }

  interface IBuildOptions {
    minify: string;
    sourcemaps: string;
    rev: string | boolean;
    cache?: string;
  }

  interface IBundle {
    options: IBuildOptions;
    name: string;
    source: string[] | {
      exclude: string[],
      include: string[]
    };
    prepend: (string | { env?: string; path: string; })[];
    dependencies: (string | { name: string, env: string, main?: string, path?: string })[]
    append: (string | { env?: string; path: string; })[];
  }

  interface ILoader {
    type: string;
    configTarget: string;
    includeBundleMetadataInConfig: string;
    plugins: ILoaderPlugin[];
    config: ILoaderConfig;
  }

  interface ILoaderPlugin {
    name: string;
    extensions: string[];
    stub: boolean;
    test: string | RegExp; // TODO: later in the code there is a swap between `string` and `RegExp`
  }

  interface ILoaderConfig {
    baseUrl: string;
    paths: IPaths;
    packages: string[];
    stubModules: string[];
    shim: object;
    wrapShim?: boolean
  }
}

interface ILoaderConfig {
  name: string;
  main?: string;
  path?: string;
  packageRoot?: string;
  lazyMain?: boolean;
  resources?: string[];
  deps?: string[];
  exports?: string[];
  wrapShim?: boolean;
}

// interface IDependencyDescription {
//   mainId: string;
//   name: string;
//   loaderConfig: ILoaderConfig
// }

interface IFile {
  contents: string;
  path?: string;
  sourceMap?: string;
  dependencyInclusion?: boolean;
}

interface IBundleSourceContext {
  pkgsMainMap: {[key: string]: string};
  config: {
    shim: {[key: string]: {
      deps: string[],
      exports: string[]
    }}}
}

