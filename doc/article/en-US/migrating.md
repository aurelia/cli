---
name: Migrating
description: Introduction of the Aurelia CLI.
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## Aurelia-CLI Bundler to Webpack

There are differences between the Aurelia CLI bundler and the Webpack bundler. When you are migrating an existing application from the integrated bundler to Webpack there are a few things to keep in mind.

The recommended way to migrate is to create a new Webpack application using the CLI, choosing similar technology as the project that you want to migrate. Then you would copy over the source code (in the `src` folder by default) and the unit tests (in the `test/unit` folder). After that you will have to make some changes to the codebase, which are explained below.

Webpack requires the use of `PLATFORM.moduleName()` for any module reference in the code, except for the import statements. `PLATFORM` can be imported using `import {PLATFORM} from 'aurelia-pal';`.

A few examples: 
- in `main.js` or `main.ts` do `aurelia.setRoot(PLATFORM.moduleName('app'))`.
- for routes do `{ ...., name: 'users', moduleId: PLATFORM.moduleName('./users'), ... }`
- `@useView(PLATFORM.moduleName('my-view.html'))`
- `.resources(PLATFORM.moduleName('resources/index'))`
- when Webpack cannot find a module even though it exists, you likely are missing a PLATFORM.moduleName for that module

The Aurelia CLI bundler gets its bundle configuration from the `aurelia_project/aurelia.json` file. This is different for Webpack, where the bundle configuration is inside `webpack.config.js`. Webpack projects created by the CLI use Aurelia's Webpack Plugin, which you'll find in `webpack.config.js`.

If you use SASS or LESS, then you are going to have to import the stylesheets differently. When you include stylesheets and use the Aurelia CLI bundler, then your `<require>` statements will have the `.css` extension: `<require from="styles/my-stylesheet.css"></require>`. When you use Webpack you have to change this into the `.sass` or `.less` extension: `<require from="styles/my-stylesheet.sass"></require>`.

