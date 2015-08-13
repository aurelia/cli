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
var cli = require('aurelia-cli');

var bundleCfg = {
  js: {
    "dist/app-bundle": {
      modules: [
        '*',
        'aurelia-bootstrapper',
        'aurelia-fetch-client',
        'aurelia-router',
        'aurelia-animator-css',
        'github:aurelia/templating-binding',
        'github:aurelia/templating-resources',
        'github:aurelia/templating-router',
        'github:aurelia/loader-default',
        'github:aurelia/history-browser'
      ],
      options: {
        inject: true
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
};

cli.command('bundle', bundleCfg);
cli.command('unbundle', bundleCfg);
```
> Note that, this bundle configuration is valid for [v0.16.2 of skeleton-navigation](https://github.com/aurelia/skeleton-navigation/tree/0.16.2) only. 

# Commands
The following section explains how to use the different CLI commands. 

To see all currently supported commands and options run:

```shell
aurelia -h
```

To get help for a specific command run:

```shell
aurelia command_name -h
```

## Bundle

With `Aureliafile.js` file placed in the root of project having the above configuration, run the following command to bundle the `js` modules and `templates`. 

```shell
aurelia bundle
```

### Common options

- *packagePath*: Set the path of `package.json` file. This allows to customize paths like `baseURL`, `config.js` etc. Example: 

```javascript
var cli = require('aurelia-cli');

var bundleCfg = {
  packagePath : '.',
  js: {
    "dist/app-bundle": {
      modules: [
        '*',
        'aurelia-bootstrapper',
 ...
 ...
```
> Note that we should only specify the `path` without the file name.

### JS bundle options
- Options
  - *inject:* set it to true to inject the bundle in `config.js`.  No manual script tag needs to be created in `index.html` to include the bundle file. SystemJS will load the bundle when any of the module of the bundle is required by the application.
  - *minify:* minifies the bundle.

- Notes:
  - Module names can be specified without the `versoon number`. CLI will search the `config.js` file to get the proper `moduleName` with version number. An error will be thrown if any conflict is found.
  - modules are not files, they are SystemJS module names/urls.
  - Globs like `*` or `*/**` can be used as well.
  - Executes relative to `baseURL`.

### Template bundle option

#### Options
  - *inject:* injects a `<link aurelia-view-bundle rel="import" href="bundle_name.html">` at the end of the body tag of  `index.html` to include the bundle file.
  - *inject* can be an object too. 

```javascript
  template: {
    "dist/app-bundle": {
      pattern: 'dist/*.html',
      options: {
        inject: {
          indexFile: 'index.html',
          destFile: 'dist/index.html'
        },
      }
    }
  }
```
  - *indexFile* : Path of the `index.html` relative to baseURL. If not specified default is `baseURL/index.html`.
  - *destFile* :  Path of the new html file with the injected link. When not specified defaults to `indexFile`.

#### Note:

  - Globs template relative to `baseURL`
  - Glob files. 
  - Multiple glob pattern can be specified as `['dist/about/*.html', 'other/**/*.html']`
  - Ignore pattern can be specified too: `['dist/**/*.html', '!dist/about/*.html']`

> To learn more details about how bundling works read [this post](http://blog.durandal.io/2015/06/23/bundling-an-aurelia-application/).

## Unbundle

This command does the following.

 - Removes any `js` bundle injection from `config.js`
 - Removes all `<link aurelia-view-bundle rel="impoort" href="" >` from the `index` file.

## Plugin

This command automates the installation of aurelia plugins. They are managed in the [aurelia registry](https://github.com/aurelia/registry).
You use this command by running

```bash
aurelia plugin
```

Now you will get a list of available plugins. By selecting one it will get automatically installed via jspm. Dont forget, you still
need to load the plugin in your application as described [here](http://aurelia.io/docs.html#plugins).  

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
