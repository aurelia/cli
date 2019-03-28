const Test = require('../test');
const ExecuteCommand = require('../../tasks/execute-command');
const fs = require('../../../../../lib/file-system');
const path = require('path');
const _ = require('lodash');

class AuGenerateTests extends Test {
  constructor(objectType, ext, plugin) {
    super(`au generate ${objectType}, writes ${objectType} file`);
    this.objectType = objectType;
    this.plugin = plugin;
    this.ext = ext;
    this.onFinish = this.onFinish.bind(this);
  }

  onFinish(message) {
    this.debug(message);

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
      if (this.plugin) {
        return [
          path.join('src', 'elements', 'new-thing.html'),
          path.join('src', 'elements', `new-thing${this.ext}`)
        ];
      }
      return [
        path.join('src', 'resources', 'elements', 'new-thing.html'),
        path.join('src', 'resources', 'elements', `new-thing${this.ext}`)
      ];
    } else if (this.objectType === 'task' || this.objectType === 'generator') {
      return [path.join('aurelia_project', this.objectType + 's', `new-thing${this.ext}`)];
    }
    if (this.plugin) {
      return [path.join('src', this.objectType + 's', `new-thing${this.ext}`)];
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
  constructor(ext, plugin) {
    super('attribute', ext, plugin);
  }
}

class AuGenerateComponentTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('component', ext, plugin);
  }
}

class AuGenerateElementTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('element', ext, plugin);
  }
}

class AuGenerateValueConverterTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('value-converter', ext, plugin);
  }
}

class AuGenerateBindingBehaviorTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('binding-behavior', ext, plugin);
  }
}

class AuGenerateTaskTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('task', ext, plugin);
  }
}

class AuGenerateGeneratorTests extends AuGenerateTests {
  constructor(ext, plugin) {
    super('generator', ext, plugin);
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
