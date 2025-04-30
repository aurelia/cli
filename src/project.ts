import * as path from 'node:path';
import * as fs from './file-system';
import * as _ from 'lodash';
import { ProjectItem } from './project-item';


export class Project implements Record<keyof AureliaJson.IPaths, ProjectItem> {
  private directory: string;
  private package: object; // package.json deserialized.
  private taskDirectory: string;
  private generatorDirectory: string;
  private model: AureliaJson.IProject;
  private aureliaJSONPath: string;
  private locations: ProjectItem[];
  /** Accessed from `aurelia_project/generator.ts` */
  public generators: ProjectItem;
  /** Accessed from `aurelia_project/task.ts` */
  public tasks: ProjectItem;

  // From AureliaJson.IPaths
  public root: ProjectItem | undefined;
  public resources: ProjectItem | undefined;
  public elements: ProjectItem | undefined;
  public attributes: ProjectItem | undefined;
  public valueConverters: ProjectItem | undefined;
  public bindingBehaviors: ProjectItem | undefined;


  static async establish(dir: string) {
    process.chdir(dir);

    const model = await fs.readFile(path.join(dir, 'aurelia_project', 'aurelia.json'));
    const pack = await fs.readFile(path.join(dir, 'package.json'));
    return new Project(dir, JSON.parse(model.toString()) as AureliaJson.IProject, JSON.parse(pack.toString()));
  }

  constructor(directory: string, model: AureliaJson.IProject, pack: object) {
    this.directory = directory;
    this.model = model;
    this.package = pack;
    this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
    this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
    this.aureliaJSONPath = path.join(directory, 'aurelia_project', 'aurelia.json');

    this.locations = Object.keys(model.paths).map(key => {
      this[key] = ProjectItem.directory(model.paths[key]);

      if (key !== 'root') {
        this[key] = ProjectItem.directory(model.paths[key]);
        this[key].parent = this.root;
      }

      return this[key];
    });
    this.locations.push(this.generators = ProjectItem.directory('aurelia_project/generators'));
    this.locations.push(this.tasks = ProjectItem.directory('aurelia_project/tasks'));
  }

  // Legacy code. This code and those ProjectItem.directory above, were kept only
  // for supporting `au generate`
  commitChanges() {
    return Promise.all(this.locations.map(x => x.create(this.directory)));
  }

  makeFileName(name: string) {
    return _.kebabCase(name);
  }

  makeClassName(name: string) {
    const camel = _.camelCase(name);
    return camel.slice(0, 1).toUpperCase() + camel.slice(1);
  }

  makeFunctionName(name: string) {
    return _.camelCase(name);
  }

  async installTranspiler() {
    switch (this.model.transpiler.id) {
    case 'babel':
      await installBabel.call(this);
      break;
    case 'typescript':
      await installTypeScript();
      break;
    default:
      throw new Error(`${this.model.transpiler.id} is not a supported transpiler.`);
    }
  }

  getExport(m: { default }, name?: string) {
    return name ? m[name] : m.default;
  }

  getGeneratorMetadata() {
    return getMetadata(this.generatorDirectory);
  }

  getTaskMetadata() {
    return getMetadata(this.taskDirectory);
  }

  async resolveGenerator(name: string) {
    const potential = path.join(this.generatorDirectory, `${name}${this.model.transpiler.fileExtension}`);
    try {
      await fs.stat(potential);
      return potential;
    } catch {
      return null;
    }
  }

  async resolveTask(name: string) {
    const potential = path.join(this.taskDirectory, `${name}${this.model.transpiler.fileExtension}`);
    try {
      await fs.stat(potential);
      return potential;
    } catch {
      return null;
    }
  }
};

async function getMetadata(dir: string) {
  const files = await fs.readdir(dir);

  const metadata = await Promise.all(files
    .sort()
    .map(file => path.join(dir, file))
    .filter(file_1 => path.extname(file_1) === '.json')
    .map(async file_2 => {
      const data = await fs.readFile(file_2);
      return JSON.parse(data.toString());
    }));
  
  return metadata;
}

async function installBabel(): Promise<void> {
  (await import('@babel/register'))({
    babelrc: false,
    configFile: false,
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-modules-commonjs', {loose: true}]
    ],
    only: [/aurelia_project/]
  });
}

async function installTypeScript(): Promise<void> {
  const ts = await import('typescript');

  const json = require.extensions['.json'];
  delete require.extensions['.json'];

  require.extensions['.ts'] = function(module: NodeJS.Module, filename: string) {
    const source = fs.readFileSync(filename);
    const result = ts.transpile(source, {
      module: ts.ModuleKind.CommonJS,
      declaration: false,
      noImplicitAny: false,
      noResolve: true,
      removeComments: true,
      noLib: false,
      emitDecoratorMetadata: true,
      experimentalDecorators: true
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (module as any)._compile(result, filename);
  };

  require.extensions['.json'] = json;
}
