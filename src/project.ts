import * as path from 'node:path';
import * as fs from './file-system';
import * as _ from 'lodash';
import { ProjectItem } from './project-item';

export class Project {
  private directory: string;
  private package: object; // package.json deserialized.
  private taskDirectory: string;
  private generatorDirectory: string;
  private model: AureliaJson.IProject;
  private aureliaJSONPath: string;
  private locations: any[];
  private root: any;
  private generators: ProjectItem;
  private tasks: ProjectItem;

  public packageManager: string | undefined;

  public paths: AureliaJson.IPaths;
  public build: AureliaJson.IBuild;

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

  installTranspiler() {
    switch (this.model.transpiler.id) {
    case 'babel':
      installBabel.call(this);
      break;
    case 'typescript':
      installTypeScript();
      break;
    default:
      throw new Error(`${this.model.transpiler.id} is not a supported transpiler.`);
    }
  }

  getExport(m: { default: string}, name?: string) {
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

function installBabel(): void {
  require('@babel/register')({
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

function installTypeScript(): void {
  const ts = require('typescript');

  const json = require.extensions['.json'];
  delete require.extensions['.json'];

  require.extensions['.ts'] = function(module, filename) {
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

    return (module as any)._compile(result, filename);
  };

  require.extensions['.json'] = json;
}
