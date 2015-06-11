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

# Commands

The following section explains how to use the different CLI commands. In order to get help inside your command line just type

```shell
aurelia COMMANDNAME -h
```

## Generate
This is used to scaffold new elements for your application. Currently it supports creating a ViewModel alongside a View.
The minimal necessary command is:

```bash
aurelia generate viewmodel -n YOURNAME
```

This will show you the generated template and prompt you whether you want to continue the file creation. The resulting file YOURNAME.js will
be placed inside the `src` folder.

### Adding a View
In order to create an additional View along your ViewModel add the `-v` attribute:

```bash
aurelia generate viewmodel -n YOURNAME -v
```

This time you'll get both templates presented and prompted whether you want to create them. Same as the ViewModel, the View will
be created as YOURNAME.html and placed in the `src` folder.

### Inject elements into your ViewModel
You can also automatically import and inject other components into your ViewModel.
To do so add either the `-i` attribute followed by the name of the component you want to inject, or via `--inject` and giving a list of components.

```bash
aurelia generate viewmodel -n YOURNAME -v --inject Element,HttpClient
```

The above example will generate the following template result:
```javascript
import { inject } from 'aurelia-framework';
import { Element } from 'aurelia-framework';
import { HttpClient } from 'aurelia-framework';

@inject(Element, HttpClient)
export class YOURNAME {
  hello = 'Welcome to Aurelia!';

  constructor(element,httpClient){

  }

  activate() {
    // called when the VM is activated
  }

  attached() {
    // called when View is attached, you are safe to do DOM operations here
  }
}
```

> Please note that the import determination is not yet fully functional and by default imports components from aurelia-framework. We'll get that sorted out.

### Unfinished attributes

* no-lifecycle
* template

## Bundle

With `Aureliafile.js` file placed in the root of project containing the above configuration, run the following command to bundle the `js` modules and `templates`. 

```shell
aurelia bundle
```

# Authoring project specific command/plugin

Currently `CLI` offers some built in commands that includes  `new`, `bundle`, and `generate` etc. Often times these are not enough you need some project specific commands. Let's see how easy it is to write one of these. 


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

That's it! This should print `Hello cli plugin world!` to the console.

You can package your plugin/command as an `npm package`,  publish  and share with the world. Our `registry`  will help you discover other great `plugins` created by the community. 
