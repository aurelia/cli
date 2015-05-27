# aurelia-cli

The command line tooling for Aurelia, used for creating projects, scaffolding, bundling and more.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to join us on [our Gitter Channel](https://gitter.im/aurelia/discuss).

# Install
Run the following command to install `aurelia-cli` 

```shell
npm install aurelia-cli -g
```
 
# Configuration

The cli uses `Aureliafile.js` for various configuration. An example config file looks like:

```javascript
  var aurelia = require('aurelia-cli');

  aurelia.command('bundle', {
    js: {
      app: {
        modules: [
          'aurelia-skeleton-navigation/*',
        ],
        options: {
          inject: true
        }
      },
      'aurelia-bundle': {
        modules: [
          'aurelia-bootstrapper',
          'aurelia-router',
          'aurelia-http-client'
        ],
        options: {
          inject: false
        }
      }
    },
    template: {
      app: {
        pattern: 'dist/*.html',
        options: {
          inject: true,
        }
      }
    }
  });
```

# Usage

With `Aureliafile.js` file placed in the root of project containing the above configuration, run the following command to bundle the `js` modules and `templates`. 

```shell
aurelia bundle
```

# Authoring project specific command/plugin

Currently `CLI` offers some built in commands that includes  `new`, `bundle`, and `generate` etc. Often times these are not enough you need some project specific commands. Let's see how easy it is to write one of these. Here we will write a `custom command` that prints `Hello cli plugin world!` to the console.


Place the following code in a file named `example-command.js` relative to the `Aureliafile`. 

```
module.exports = function ExampleCommand(program, config, logger) {
    var self = this;

    program.command('example')
      .alias('e')
      .description('This is just an example command to show how to write a plugin')
      .action(function (options) {
         console.log('Hello cli plugin world!');
      });
};
```
> You can place the file any where in your project directory. You may organize all your custom commands in a `command` directory.

Now, let's `require` the command in the `Aureliafie.js`. It should look like:

```javascript

  var aurelia = require('aurelia-cli');

  var ExampleCommand = require('./example-command');
  
  aurelia.command(ExampleCommand);

```

Notice `aurelia.command(...)` this is actually hooking the plugin with `cli`. With that in place run:

```shell
aurelia example
```

