import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class GeneratorGenerator {
  constructor(project, options, ui) {
    this.project = project;
    this.options = options;
    this.ui = ui;
  }

  execute() {
    let name = this.options.args[0];
    let fileName = this.project.makeFileName(name);
    let className = this.project.makeClassName(name);

    this.project.generators.add(
      ProjectItem.text(`${fileName}.js`, this.generateJSSource(className))
    );

    return this.project.commitChanges()
      .then(() => this.ui.log(`${className}Generator created.`));
  }

  generateSource(className) {
return `import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class ${className}Generator {
  constructor(project, options, ui) {
    this.project = project;
    this.options = options;
    this.ui = ui;
  }

  execute() {
    let name = this.options.args[0];
    let fileName = this.project.makeFileName(name);
    let className = this.project.makeClassName(name);

    this.project.elements.add(
      ProjectItem.text(\`\${fileName}.js\`, this.generateSource(className))
    );

    return this.project.commitChanges()
      .then(() => this.ui.log(\`\${className} created.\`));
  }

  generateSource(className) {
return \`import {bindable} from 'aurelia-framework';

export class \${className} {
  @bindable value;

  valueChanged(newValue, oldValue) {

  }
}\`
  }
}
`
  }
}
