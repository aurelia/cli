const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const fs = require('../../../../../lib/file-system');
const path = require('path');
const _ = require('lodash');

class AuGenerateTests extends Test {
  constructor(objectType, ext) {
    super(`au generate ${objectType}, writes ${objectType} file`);
    this.objectType = objectType;
    this.ext = ext;
    this.onFinish = this.onFinish.bind(this);
  }

  onFinish(message) {
    this.logger.debug(message);

    if (_.every(this.createdFiles(), fs.isFile)) {
      this.success();
      this.executeCommand.stop();
    }
  }

  createdFiles() {
    if (this.objectType === 'component') {
      return [
        path.join('src', 'new-thing.html'),
        path.join('src', `new-thing${this.ext}`)
      ];
    } else if (this.objectType === 'element') {
      return [
        path.join('src', 'resources', 'elements', 'new-thing.html'),
        path.join('src', 'resources', 'elements', `new-thing${this.ext}`)
      ];
    } else if (this.objectType === 'task' || this.objectType === 'generator') {
      return [path.join('aurelia_project', this.objectType + 's', `new-thing${this.ext}`)];
    }
    return [path.join('src', 'resources', this.objectType + 's', `new-thing${this.ext}`)];
  }

  additionalArguments() {
    if (this.objectType === 'component') {
      return ['NewThing', '.'];
    }
    return ['NewThing'];
  }

  execute() {
    this.executeCommand = new ExecuteCommand(
      'au', ['generate', this.objectType, ...this.additionalArguments()],
      this.onFinish,
      this.onFinish
    );
    return this.executeCommand.executeAsNodeScript();
  }
}

class AuGenerateAttributeTests extends AuGenerateTests {
  constructor(ext) {
    super('attribute', ext);
  }
}

class AuGenerateComponentTests extends AuGenerateTests {
  constructor(ext) {
    super('component', ext);
  }
}

class AuGenerateElementTests extends AuGenerateTests {
  constructor(ext) {
    super('element', ext);
  }
}

class AuGenerateValueConverterTests extends AuGenerateTests {
  constructor(ext) {
    super('value-converter', ext);
  }
}

class AuGenerateBindingBehaviorTests extends AuGenerateTests {
  constructor(ext) {
    super('binding-behavior', ext);
  }
}

class AuGenerateTaskTests extends AuGenerateTests {
  constructor(ext) {
    super('task', ext);
  }
}

class AuGenerateGeneratorTests extends AuGenerateTests {
  constructor(ext) {
    super('generator', ext);
  }
}


module.exports = {
  AuGenerateAttributeTests,
  AuGenerateComponentTests,
  AuGenerateElementTests,
  AuGenerateValueConverterTests,
  AuGenerateBindingBehaviorTests,
  AuGenerateTaskTests,
  AuGenerateGeneratorTests
};
