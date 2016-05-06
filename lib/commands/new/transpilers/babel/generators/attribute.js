import {inject} from 'aurelia-dependency-injection';
import {Project, ProjectItem, CLIOptions} from 'aurelia-cli';

@inject(Project, CLIOptions)
export default class AttributeGenerator {
  constructor(project, options) {
    this.project = project;
    this.options = options;
  }

  execute() {
    let name = this.options.args[0];
    let fileName = project.makeFileName(name);
    let className = project.makeClassName(name);

    this.project.attributes.add(
      ProjectItem.text(`${fileName}.js`, this.generateSource(className))
    );

    return this.project.commitChanges();
  }

  generateSource(className) {
`import {inject} from 'aurelia-framework';

@inject(Element)
export class ${className}CustomAttribute {
  constructor(element) {
    this.element = element;
  }

  valueChanged(newValue, oldValue) {

  }
}`
  }
}
