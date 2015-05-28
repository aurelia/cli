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
module.exports = function(aurelia) {
  aurelia.bundle({
    js: [{
      moduleExpression: 'aurelia-skeleton-navigation/*',
      fileName: 'nav-app-build.js',
      options: {
        inject: true
      }
    }, {
      moduleExpression: 'aurelia-bootstrapper',
      fileName: 'aurelia-framework-build.js',
      options: {
        inject: true
      }
    }],
    template : {
      pattern : 'dist/*',
      outfile : 'bundle.html'
    }
  });
}
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

@inject(Element)
@inject(HttpClient)
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
With `Aureliafile.js` file placed in the root of project containing the above configuration, run the following command to bundle the `js` modules. 

```shell
aurelia bundle
```

To bundle the templates use:

```shell
aurela tb
``

