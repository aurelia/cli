declare namespace Webpack {
  export class Dependency {
    module: Module | null;
    getReference(): { module: Module | null, importedNames: boolean | string[] } | null;
    static compare(a: Dependency, b: Dependency): number;
  }

  export class DependenciesBlock {
    dependencies: Dependency[];
    
    addDependency(dependency: Dependency): void;
  }

  export class Module extends DependenciesBlock {
    id: string;
    meta: object|null;
    rawRequest: string;
    reasons: Reason[];
    resource: string;
    
    isUsed(_export: string): boolean | string;    
  }

  export interface Reason {
    module: Module;
    dependency: Dependency;
  }

  export type Expression =
    MemberExpression | 
    IdentifierExpression |
    CallExpression |
    ObjectExpression;

  export class MemberExpression {
    range: [number, number];
    // Those types are not correct, but that's enough to compile this project
    property: IdentifierExpression;
    object: { name: string; type: string; } & MemberExpression;
    type: "MemberExpression";
  }

  export class IdentifierExpression {
    range: [number, number];
    name: string;
    type: "IdentifierExpression";
  }

  export class CallExpression {
    range: [number, number];
    arguments: Expression[];
    type: "CallExpression";
  }

  export class ObjectExpression {
    range: [number, number];
    type: "ObjectExpression";
    properties: {
      key: {
        type: string;
        name: string;
      };
      value: Expression;
    }[];
  }

  export class Parser {
    state: {
      current: Module;
      module: Module;
    }

    plugin(type: string, cb: (e: Expression) => any): void;
    evaluateExpression(expr: Expression): EvaluatedExpression;
    apply(plugin: Object): void;
  }

  export class EvaluatedExpression {
    isString(): boolean;
    isArray(): boolean;
    string?: string;
    items?: EvaluatedExpression[];
  }

  export class Compiler {
    options: Options;

    apply(...plugin: Object[]): void;
    plugin(type: "compilation", cb: (compilation: Compilation, params: CompilationParameters) => void): void;    
    plugin(type: "before-compile", cb: (params: {}, callback: Function) => void): void;    
    resolvers: {
      normal: Resolver;
    }
  }

  interface Options {
    entry: string | string[] | { [name: string]: string | string[] };
    target: string;
    module: {
      rules?: { test?: RegExp; use: string | string[] }[];
      loaders?: { test?: RegExp; use: string | string[] }[]; // same as rules, supported for backward compat with 1.x
    };
    resolve: {
      alias: { [key: string]: string };
      modules: string[];
      extensions: string[];
      plugins: Object[];
      symlinks: boolean;
    }; 
    resolveLoader: {
      alias?: { [key: string]: string };      
      symlinks: boolean;
    };
    plugins: object[];
  }

  export class Compilation {
    options: Options;
    inputFileSystem: FileSystem;

    dependencyFactories: { set(d: any, f: ModuleFactory): void; };
    dependencyTemplates: { set(d: any, f: any): void; };
    plugin(type: "succeed-module", cb: (module: Webpack.Module) => void): void;
    plugin(type: "before-module-ids", cb: (modules: Module[]) => void): void;
    plugin(type: "finish-modules", cb: (modules: Module[]) => void): void;
  }

  export class CompilationParameters {
    normalModuleFactory: ModuleFactory;  
  }

  export class Source {
    replace(from: number, to: number, text: string): void;
  }

  export class ModuleFactory {
    plugin(type: "parser", cb: (parser: Parser) => void): void;
  }

  type ResolverCallback = (request: ResolveRequest, cb: (err?: any, result?: any) => void) => void;

  export class Resolver {    
    fileSystem: FileSystem;
    plugin(type: "resolve-step", handler: (type: string, request: ResolveRequest) => void): void;
    plugin(type: "after-resolve", handler: ResolverCallback): void;
    plugin(type: "before-described-resolve", handler: ResolverCallback): void;
    doResolve(step: string, request: ResolveRequest, message: string, cb: (err?: any, result?: any) => void): void;
    resolve(context: string|null, path: string, request: string, cb: (err: any, result: string) => void): void;
  }

  export class ResolveRequest {
    path: string;
    request: string;
    context: any;
  }

  export interface FileSystem {
    readdirSync(path: string): string[];
    statSync(fname: string): { 
      isDirectory(): boolean; 
      isFile(): boolean;
    };
  }

  export interface Loader {
    _module: Module;
    cacheable?(): void;
  }
}

declare module "webpack" {
  export class DefinePlugin {
    constructor(hash: any);
  }

  export class DllPlugin {    
  }

  export class DllReferencePlugin {    
  }
}

declare module "webpack/lib/Dependency" {
  const Dependency: typeof Webpack.Dependency;
  export = Dependency;
}

declare module "webpack/lib/dependencies/NullDependency" {
  class NullDependencyTemplate {
  }

  class NullDependency extends Webpack.Dependency {    
    static Template: typeof NullDependencyTemplate;
  }

  export = NullDependency;
}

declare module "webpack/lib/dependencies/ModuleDependency" {
  class ModuleDependency extends Webpack.Dependency {    
    constructor(request: string);
    request: string;
  }

  export = ModuleDependency;
}

declare module "webpack/lib/BasicEvaluatedExpression" {
  class BasicEvaluatedExpression {    
    setIdentifier(identifier: string): this;
    setRange(range: [number, number]): this;
  }

  export = BasicEvaluatedExpression;
}

declare module "html-loader/lib/attributesParser" {
  function parse(content: string, cb: (tag: string, attr: string) => boolean): { value: string }[];

  export = parse;
}

declare interface DependencyOptionsEx {}

declare module "minimatch" {
  interface IMinimatch {
      match(fname: string, partial: boolean): boolean;
  }
}