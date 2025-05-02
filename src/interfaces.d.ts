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

interface ICommand {
  execute(args?: string[]): Promise<void>
}
