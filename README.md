# aurelia-cli

The command line tooling for Aurelia, used for creating projects, scaffolding, bundling and more.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/). If you have questions, we invite you to join us on [our Gitter Channel](https://gitter.im/aurelia/discuss).

# Install
Run the following command to install `aurelia-cli` 

```shell
npm install aurelia-cli -g
```
 
# Configuration

The cli uses `Aureliafile.js` for various configuration. A typical example with bundle config for [skeleton-navigation](https://github.com/aurelia/skeleton-navigation) looks like:

```javascript
var aurelia = require('aurelia-cli');

aurelia.command('bundle', {
  js: {
    "dist/app-bundle": {
      modules: [
        '*',
        'aurelia-bootstrapper',
        'aurelia-http-client',
        'aurelia-router',
        'aurelia-animator-css',
        'github:aurelia/templating-binding@0.12.0',
        'github:aurelia/templating-resources@0.12.1',
        'github:aurelia/templating-router@0.13.0',
        'github:aurelia/loader-default@0.8.0',
        'github:aurelia/history-browser@0.5.0'
      ],
      options: {
        inject: true,
        minify: true
      }
    }
  },
  template: {
    "dist/app-bundle": {
      pattern: 'dist/*.html',
      options: {
        inject: true
      }
    }
  }
});
```
> Note that, this bundle configuration is valid for [v0.14.0 of skeleton-navigation](https://github.com/aurelia/skeleton-navigation/tree/0.14.0) only.

# Commands
The following section explains how to use the different CLI commands. 

To see all currently supported commands and options run:

```shell
aurelia -h
```

To get help for a specific command run:

```shell
aurelia COMMANDNAME -h
```

## Bundle

With `Aureliafile.js` file placed in the root of project having the above configuration, run the following command to bundle the `js` modules and `templates`. 

```shell
aurelia bundle
```
### JS bundle options
- Options
  - *inject:* set it to true to inject the bundle in `config.js`.  No manual script tag needs to be created in `index.html` to include the bundle file. SystemJS will load the bundle when any of the module of the bundle is required by the application.
  - *minify:* minifies the bundle.

- Notes:
  - modules are not files, they are SystemJS module names.
  - Globs like `*` or `*/**` can be used as well.
  - Executes relative to `baseURL`.
  - `paths` are important to consider when specifying `module names` 

### Template bundle option
- Option
  - *inject:* injects a `<link aurelia-view-bundle rel="import" href="bundle_name.html">` at the end of the body tag of  `index.html` to include the bundle file.

- Note:
  - Globs template relative to `baseURL`
  - Glob files. 
  - Multiple glob pattern can be specified as `['dist/about/*.html', 'other/**/*.html']`
  - Ignore pattern can be specified too: `['dist/**/*.html', '!dist/about/*.html']`

> To learn more details about how bundling works read [this post](http://blog.durandal.io/2015/06/23/bundling-an-aurelia-application/).

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


# Authoring project specific command/plugin
Coming soon!
