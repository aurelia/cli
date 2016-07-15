# Aurelia CLI

[![npm Version](https://img.shields.io/npm/v/aurelia-cli.svg)](https://www.npmjs.com/package/aurelia-cli)
[![ZenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.io)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains its CLI implementation.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.durandal.io/) and [our email list](http://durandal.us10.list-manage1.com/subscribe?u=dae7661a3872ee02b519f6f29&id=3de6801ccc). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions, please [join our community on Gitter](https://gitter.im/aurelia/discuss). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome or Firefox Extension and visit any of our repository's boards. You can get an overview of all Aurelia work by visiting [the framework board](https://github.com/aurelia/framework#boards).

> **Note:** The CLI is currently in Alpha and as such may not be suitable for use on all projects yet. In particular, projects that need to make use of extensive 3rd party libraries or Aurelia plugins may not yet work or may require extensive custom configuration or workarounds. We are in the process of addressing these issues.

## Machine Setup

The CLI itself has a couple of prerequisites that you must install first:

* Install NodeJS >= 4.x
    * You can [download it here](https://nodejs.org/en/).
    * There may be some issues with Node 6. If you experience that, please help us track them down and resolve them.
* Install a Git Client
    * Here's [a nice GUI client](https://desktop.github.com).
    * Here's [a standard client](https://git-scm.com).

Once you have the prerequisites installed, you can install the Aurelia CLI itself. From the command line, use npm to install the CLI globally:

```
npm install aurelia-cli -g
```

> Note: Always run commands from a Bash prompt. Depending on your environment, you may need to use `sudo` when executing npm global installs.

> Note: While creating a new project doesn't require NPM 3, front-end development, in general, requires a flat-package structure, which is not what NPM < 3 provides. It is recommended that you update to NPM 3, which will be able to manage this structural requirement. You can check your NPM version with `npm -v`. If you need to update, run `npm install npm -g`.

## Creating A New Aurelia Project

To create a new project, you can run `au new`. You will be presented with a number of options. If you aren't sure what you want, you can select one of the defaults. Otherwise, you can create a custom project. Simply follow the prompts.

Once you've made your choice, the CLI will show you your selections and ask if you'd like to create the file structure. After that, you'll be asked if you would like to install your new project's dependencies.

Once the dependencies are installed, your project is ready to go.

### ASP.NET Core

If you would like to use ASP.NET Core, first begin by using Visual Studio to create your ASP.NET Core project. Select whatever options make the most sense based on your .NET project plans. After you have created the project, open a command line and change directory into your web project's project folder. This is the folder that contains the `.xproj` file. From within this folder, you can execute the following command `au new --here` which will setup Aurelia "here" inside this project folder. You will be prompted to choose the platform you want. Simply select "ASP.NET Core". Follow the prompts for the rest of the process, just like above.

Note: ASP.NET Core Platform support is in an early stage of development.

## Running Your Aurelia App

From inside your project folder, simply execute `au run`. This will build your app, creating all bundles in the process. It will start a minimal web server and serve your application. If you would like to develop, with auto-refresh of the browser, simply specify the `--watch` flag like this: `au run --watch`.

### Environments

The CLI build system understands that you might run your code in different environments. By default, you are set up with three: `dev`, `stage` and `prod`. You can use the `--env` flag to specify what environment you want to run under. For example: `au run --env prod --watch`.

## Building Your App

Aurelia CLI apps always run in bundled mode, even during development. To build your app, simply run `au build`. You can also specify an environment to build for. For example: `au build --env stage`.

## Unit Testing

If you selected a project setup that includes unit tests, you can run your tests with `au test`. If you would like to adopt a tdd-based workflow, writing code and tests with continual test evaluation, you can use the `--watch` flag. For example: `au test --watch`.

## Generators

Executing `au generate resource` runs a generator to scaffold out typical Aurelia constructs. Resource options are: element, attribute, value-converter, binding-behavior, task and generator. That's right...there's a generator generator so you can write your own. Ex. `au generate element`

## Adding Client Libraries to Your Project

If you need to add a 3rd party client library to your project, first `npm install` the library. After that, open the `aurelia_project/aurelia.json` file and scroll down to the `build.bundles` section. You'll need to add the library into one of your bundle's `dependencies` sections.

> Note: One of the first new features you'll see soon is a command to help you with 3rd party module configuration. The command will inspect a previously npm-installed package, and make a configuration recommendation to you, automating the process if you desire.

Below is some guidance for how to manually configure several different common 3rd party library scenarios:

#### A Single-File Module

If the library you have installed is a single CommonJS or AMD file, you can add an entry similar to the following to the dependencies of yoru bundle:

```javascript
"dependencies": [
  {
    "name": "library-name",
    "path": "../node_modules/library-name/dist/library-name"
  }
]
```

* `name` - This is the name of the library as you will import it in your JavaScript or TypeScript code.
* `path` - This is a path to the single module file itself. This path is relative to your application's `src` folder. Also, you should not include the file extension. `.js` will be appended automatically.

If the `main` field of the library's `package.json` points to the single file that you need to bundle, then you can opt for a simplified configuration by just adding the package name to your dependencies directly:

```javascript
"dependencies": [
  "library-name"
]
```

#### A CommonJS Package

Many modules installed through NPM are packages made up of multiple source files. Configuring a library like this is a bit different than the single-file scenario above. Here's an example configuration for a multi-file package:

```javascript
"dependencies": [
  {
    "name": "aurelia-testing",
    "path": "../node_modules/aurelia-testing/dist/amd",
    "main": "aurelia-testing",
    "env": "dev"
  }
]
```

* `name` - This is the name of the library as you will import it in your JavaScript or TypeScript code.
* `path` - This is a path to the folder where the package's source is located. This path is relative to your application's `src` folder.
* `main` - This is the main module (entry point) of the package, relative to the `path`. You should not include the file extension. `.js` will be appended automatically.

> Note: We've also shown how to use the `env` setting on a dependency. This can be used on any dependency in the bundle to indicate what environment builds the dependency should be included in. Bey default, dependencies are included in all builds. The example above shows how to include the library only in builds targeting the "dev" environment. You can also specify multiple environments like `dev & stage`.

#### A Legacy Library

Libraries that predate module systems can be a pain because they often rely on global scripts which must be loaded before the library. These libraries also add their own global variables. An example of one such library is [bootstrap](http://getbootstrap.com/css/). Let's take a look at how to handle a legacy library like that.

```javascript
"dependencies": [
  "jquery",
  {
    "name": "bootstrap",
    "path": "../node_modules/bootstrap/dist",
    "main": "js/bootstrap.min",
    "deps": ["jquery"],
    "exports": "$"
  }
]
```

* `name` - This is the name of the library as you will import it in your JavaScript or TypeScript code.
* `path` - This is a path to the folder where the package's source is located. This path is relative to your application's `src` folder.
* `main` - This is the main module (entry point) of the package, relative to the `path`. You should not include the file extension. `.js` will be appended automatically.
* `deps` - This is an array of dependencies which must be loaded and available before the legacy library can be evaluated.
* `exports` - This is the name of the global variable that should be used as the exported value of the module.

Notice first that we've included "jquery" as one of our dependencies. We are able to use the simplified form because it's a single file and its `package.json` `main` points directly to that file. Below that we configure `bootstrap`. The first three properties are the same as in our package example above. However, now we have a `deps` list. We've included `jquery` since Bootstrap needs it to be present before it can load. Finally, we have the `exports` property. Usually a library creates a unique global variable, but jQuery plugins, like Bootstrap, are different. They attach their APIs to the jQuery object itself. So, in this case, we export the jQuery object as the module. This could be any global variable though.

#### A Library with Additional Resources

The Bootstrap example above results in the bundling of the JavaScript portions of the library. But, as you probably know, Bootstrap is mostly about CSS. The CSS files distributed with Bootstrap aren't traceable through the module system so this still doesn't result in the Bootstrap CSS being bundled. Here's how we solve that problem:

```javascript
"dependencies": [
  "jquery",
  {
    "name": "bootstrap",
    "path": "../node_modules/bootstrap/dist",
    "main": "js/bootstrap.min",
    "deps": ["jquery"],
    "exports": "$",
    "resources": [
      "css/bootstrap.css"
    ]
  }
]
```

Notice that we've added a `resources` array. Here we can provide a list of additional files to be included with the bundle. These files are relative to the `path` designated above and must include the file extension. You can also use glob patterns in place of exact file names.

> Note: Remember that CSS bundled in this was is bundled as a text resource designed to be required in your view. To load the Bootstrap css file in a view, use `<require from="bootstrap/css/bootstrap.css"></require>`. Notice that the module name derives from combining the `name` property with the resource.

#### A Very Stubborn Legacy Library

Sometimes you can't get a library to work with the module loading system. That's ok. You can still include it in the bundle, using traditional concatenation techniques. In fact, this is how the CLI bundles up the loader and promise polyfills. These items don't go into the `dependencies` section but instead go into the `prepend` section. This is because they aren't module dependencies. They also aren't relative to the `src`, but relative to the project folder. Using the `prepend` section causes the scripts to be prepended to the beginning of the bundle, using normal script concatenation techniques. Here's a full vendor bundle example, showing this and the rest of the techniques listed above.

```javascript
{
  "name": "vendor-bundle.js",
  "prepend": [
    "node_modules/bluebird/js/browser/bluebird.core.js",
    "scripts/require.js"
  ],
  "dependencies": [
    "aurelia-binding",
    "aurelia-bootstrapper",
    "aurelia-dependency-injection",
    "aurelia-event-aggregator",
    "aurelia-framework",
    "aurelia-history",
    "aurelia-history-browser",
    "aurelia-loader",
    "aurelia-loader-default",
    "aurelia-logging",
    "aurelia-logging-console",
    "aurelia-metadata",
    "aurelia-pal",
    "aurelia-pal-browser",
    "aurelia-path",
    "aurelia-polyfills",
    "aurelia-route-recognizer",
    "aurelia-router",
    "aurelia-task-queue",
    "aurelia-templating",
    "aurelia-templating-binding",
    "nprogress",
    "jquery",
    {
      "name": "bootstrap",
      "path": "../node_modules/bootstrap/dist",
      "main": "js/bootstrap.min",
      "deps": ["jquery"],
      "exports": "$",
      "resources": [
        "css/bootstrap.css"
      ]
    },
    {
      "name": "text",
      "path": "../scripts/text"
    },
    {
      "name": "aurelia-templating-resources",
      "path": "../node_modules/aurelia-templating-resources/dist/amd",
      "main": "aurelia-templating-resources"
    },
    {
      "name": "aurelia-templating-router",
      "path": "../node_modules/aurelia-templating-router/dist/amd",
      "main": "aurelia-templating-router"
    },
    {
      "name": "aurelia-testing",
      "path": "../node_modules/aurelia-testing/dist/amd",
      "main": "aurelia-testing",
      "env": "dev"
    }
  ]
}
```

## Styling your Application

There are many ways to style components in Aurelia. The CLI sets up your project to only process styles inside your application's `src` folder. Those styles can then be imported into a view using Aurelia's `require` element.

* If you aren't using any CSS preprocessor, you write css and then simply require it in the view like this:
    ```html

    <require from="./path/to/styles.css"></require>

    ```
* For projects that use a CSS preprocessor (chosen from the cli setup questions):
  * Write your styles in the format you chose (styl, sass, less ...).
  * Require the style by `[filename].css` instead of `[filename].[extension]`. This is because
      your style file is transpiled into a module that encodes the resulting `css` file extension.
    ```html

    <!-- example -->
    <!-- if you have stylus at: [project_root]/src/styles/main.styl -->
    <require from ="./styles/main.css"></require>

    ```

Bear in mind that you can always configure things any way you want by modifying the tasks in the `aurelia_project/tasks` folder.
For styling purposes, you can modify the `process-css.js` file.

## What if I forget this stuff?

If you need your memory refreshed as to what the available options are, at any time you can execute `au help`. If you aren't sure what version of the CLI you are running, you can run `au -v`;
