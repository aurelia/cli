---
{
  "name": "CLI: Basics",
  "culture": "en-US",
  "description": "Introduction of the Aurelia CLI.",
  "engines" : { "aurelia-doc" : "^1.0.0" },
  "author": {
    "name": "Jeroen Vinke",
  	"url": "http://jeroenvinke.nl"
  },
  "contributors": [],
  "translators": [],
  "keywords": ["CLI"]
}
---

## [Introduction](aurelia-doc://section/1/version/1.0.0)

The Aurelia CLI is the official command line tool for Aurelia. It can be used to create new projects, scaffold components and to bundle your application for release. It is the best way to get started on a new Aurelia project.

## [Machine Setup](aurelia-doc://section/2/version/1.0.0)

The CLI itself has a couple of prerequisites that you must install first:

* Install NodeJS version 4.x or above.
    * You can [download it here](https://nodejs.org/en/).
* Install a Git Client
    * Here's [a nice GUI client](https://desktop.github.com).
    * Here's [a standard client](https://git-scm.com).

Once you have the prerequisites installed, you can install the Aurelia CLI itself. From the command line, use npm to install the CLI globally:

```
npm install aurelia-cli -g
```

> Info
> Always run commands from a Bash prompt. Depending on your environment, you may need to use `sudo` when executing npm global installs.

> Warning
> While creating a new project doesn't require NPM 3, front-end development, in general, requires a flat-package structure, which is not available with NPM versions prior to 3. It is recommended that you update to NPM 3, which will be able to manage this structural requirement. You can check your NPM version with `npm -v`. If you need to update, run `npm install npm -g`.

## [Creating A New Aurelia Project](aurelia-doc://section/3/version/1.0.0)

To create a new project, you can run `au new`. You will be presented with a number of options. If you aren't sure what you want, you can select one of the defaults. Otherwise, you can create a custom project. Simply follow the prompts.

Once you've made your choice, the CLI will show you your selections and ask if you'd like to create the file structure. After that, you'll be asked if you would like to install your new project's dependencies.

Once the dependencies are installed, your project is ready to go.


## [Running Your Aurelia App](aurelia-doc://section/4/version/1.0.0)

From inside your project folder, simply execute `au run`. This will build your app, creating all bundles in the process. It will start a minimal web server and serve your application. If you would like to develop, with auto-refresh of the browser, simply specify the `--watch` flag like this: `au run --watch`. If you have chosen to use ASP.NET Core and Webpack, you will want to use the `dotnet run` command instead of `au run`.

## [Environments](aurelia-doc://section/5/version/1.0.0)

The CLI build system understands that you might run your code in different environments. By default, you are set up with three: `dev`, `stage` and `prod`. You can use the `--env` flag to specify what environment you want to run under. For example: `au run --env prod --watch`.

When you do a build the `src/environment.js` or `src/environment.ts` file will be overwritten by either the `dev.js`, `stage.js` or `prod.js` file from the `aurelia_project/environments` directory.

## [Building Your App](aurelia-doc://section/6/version/1.0.0)

Aurelia CLI apps always run in bundled mode, even during development. To build your app, simply run `au build`. You can also specify an environment to build for. For example: `au build --env stage`.

## [Generators](aurelia-doc://section/7/version/1.0.0)

Executing `au generate <resource>` runs a generator to scaffold out typical Aurelia constructs. Options for *resource* are: element, attribute, value-converter, binding-behavior, task and generator. That's right...there's a generator generator so you can write your own. Ex. `au generate element`

## [Aurelia.json](aurelia-doc://section/8/version/1.0.0)
In the `aurelia_project` directory there is a file called `aurelia.json`. This file is a centralized file containing all settings you might need for your gulp tasks and configuration files. Since it's in a JSON format, it's easy to import from Node.js. The aurelia.json file is meant to be used by your tooling, not your application. 

## [Webpack vs SystemJS vs RequireJS](aurelia-doc://section/9/version/1.0.0)
The Aurelia CLI supports a bunch of different technology and during `au new` you can select a module loader, bundler, CSS preprocessor and more. But what module loader and bundler should you choose?

Webpack is a bundler whereas SystemJS and RequireJS are module loaders. Since bundles load much more quickly in the browser than individual files, the CLI will use its own internal bundler when you choose for the SystemJS or RequireJS module loader. If you choose to use Webpack then you typically don't need a module loader.

Webpack is a very powerful module bundler. Setting up Webpack from scratch could be a very daunting task though. Luckily the Aurelia CLI sets Webpack up for you based on the technology that you select during `au new`. Because there is no module loader when you choose for Webpack, all modules that your application needs have to be bundled by Webpack. Sometimes you will need to help the bundler out by using `PLATFORM.moduleName()` calls for module references in your code.  

Webpack is growing in popularity and there is a wealth of loaders, plugins, and documentation available for it.

SystemJS is a "Dynamic ES module loader". When you choose for SystemJS during `au new` you're also getting the Aurelia CLI Bundler. This is a powerful combination that bundles your application, but also allows you to load modules at runtime that are not in the bundle. SystemJS is actively being developed as it tries to stay in sync with the WhatWG Loader specification.

RequireJS has been around for a long time. As opposed to SystemJS it is done and no large changes are made, which makes it a little bit more stable than SystemJS. With either module loader (RequireJS, SystemJS) you will be using the Aurelia CLI Bundler. Both SystemJS and RequireJS support loader plugins, such as `text`, `json` and `svg`. The bundle configuration is in the same format for both module loaders. 

Resources:
- http://requirejs.org/
- https://github.com/systemjs/systemjs/
- https://webpack.github.io/

## [What if I forget this stuff?](aurelia-doc://section/10/version/1.0.0)

If you need your memory refreshed as to what the available options are, at any time you can execute `au help`. If you aren't sure what version of the CLI you are running, you can run `au -v`;
