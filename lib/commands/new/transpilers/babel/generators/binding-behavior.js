import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions, UI} from 'aurelia-cli';

@inject(Project, CLIOptions, UI)
export default class BindingBehaviorGenerator {
  constructor(project, options, ui) {
    this.project = project;
    this.options = options;
    this.ui = ui;
  }

  execute() {
    let name = this.options.args[0];
    let fileName = this.project.makeFileName(name);
    let className = this.project.makeClassName(name);

    this.project.bindingBehaviors.add(
      ProjectItem.text(`${fileName}.js`, this.generateSource(className))
    );

    return this.project.commitChanges()
      .then(() => this.ui.log(`${className}BindingBehavior created.`));
  }

  generateSource(className) {
return `export class ${className}BindingBehavior {
  bind(binding, source) {

  }

  unbind(binding, source) {

  }
}`
  }
}
