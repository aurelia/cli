"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("./file-system"));
const _ = __importStar(require("lodash"));
const project_item_1 = require("./project-item");
class Project {
    directory;
    package; // package.json deserialized.
    taskDirectory;
    generatorDirectory;
    model;
    aureliaJSONPath;
    locations;
    generators;
    tasks;
    packageManager;
    paths;
    build;
    // From AureliaJson.IPaths
    root;
    resources;
    elements;
    attributes;
    valueConverters;
    bindingBehaviours;
    static async establish(dir) {
        process.chdir(dir);
        const model = await fs.readFile(path.join(dir, 'aurelia_project', 'aurelia.json'));
        const pack = await fs.readFile(path.join(dir, 'package.json'));
        return new Project(dir, JSON.parse(model.toString()), JSON.parse(pack.toString()));
    }
    constructor(directory, model, pack) {
        this.directory = directory;
        this.model = model;
        this.package = pack;
        this.taskDirectory = path.join(directory, 'aurelia_project/tasks');
        this.generatorDirectory = path.join(directory, 'aurelia_project/generators');
        this.aureliaJSONPath = path.join(directory, 'aurelia_project', 'aurelia.json');
        this.locations = Object.keys(model.paths).map(key => {
            this[key] = project_item_1.ProjectItem.directory(model.paths[key]);
            if (key !== 'root') {
                this[key] = project_item_1.ProjectItem.directory(model.paths[key]);
                this[key].parent = this.root;
            }
            return this[key];
        });
        this.locations.push(this.generators = project_item_1.ProjectItem.directory('aurelia_project/generators'));
        this.locations.push(this.tasks = project_item_1.ProjectItem.directory('aurelia_project/tasks'));
    }
    // Legacy code. This code and those ProjectItem.directory above, were kept only
    // for supporting `au generate`
    commitChanges() {
        return Promise.all(this.locations.map(x => x.create(this.directory)));
    }
    makeFileName(name) {
        return _.kebabCase(name);
    }
    makeClassName(name) {
        const camel = _.camelCase(name);
        return camel.slice(0, 1).toUpperCase() + camel.slice(1);
    }
    makeFunctionName(name) {
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
    getExport(m, name) {
        return name ? m[name] : m.default;
    }
    getGeneratorMetadata() {
        return getMetadata(this.generatorDirectory);
    }
    getTaskMetadata() {
        return getMetadata(this.taskDirectory);
    }
    async resolveGenerator(name) {
        const potential = path.join(this.generatorDirectory, `${name}${this.model.transpiler.fileExtension}`);
        try {
            await fs.stat(potential);
            return potential;
        }
        catch {
            return null;
        }
    }
    async resolveTask(name) {
        const potential = path.join(this.taskDirectory, `${name}${this.model.transpiler.fileExtension}`);
        try {
            await fs.stat(potential);
            return potential;
        }
        catch {
            return null;
        }
    }
}
exports.Project = Project;
;
async function getMetadata(dir) {
    const files = await fs.readdir(dir);
    const metadata = await Promise.all(files
        .sort()
        .map(file => path.join(dir, file))
        .filter(file_1 => path.extname(file_1) === '.json')
        .map(async (file_2) => {
        const data = await fs.readFile(file_2);
        return JSON.parse(data.toString());
    }));
    return metadata;
}
async function installBabel() {
    (await Promise.resolve().then(() => __importStar(require('@babel/register'))))({
        babelrc: false,
        configFile: false,
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-transform-class-properties', { loose: true }],
            ['@babel/plugin-transform-modules-commonjs', { loose: true }]
        ],
        only: [/aurelia_project/]
    });
}
async function installTypeScript() {
    const ts = await Promise.resolve().then(() => __importStar(require('typescript')));
    const json = require.extensions['.json'];
    delete require.extensions['.json'];
    require.extensions['.ts'] = function (module, filename) {
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
        return module._compile(result, filename);
    };
    require.extensions['.json'] = json;
}
//# sourceMappingURL=project.js.map