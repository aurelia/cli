<a name="0.31.3"></a>
## [0.31.3](https://github.com/aurelia/cli/compare/0.31.2...0.31.3) (2017-08-26)


### Bug Fixes

* **protractor:** typescript errors when not using jest typings ([1ee7b91](https://github.com/aurelia/cli/commit/1ee7b91))
* **webpack:** remove comma from arguments ([666d7c0](https://github.com/aurelia/cli/commit/666d7c0))



<a name="0.31.2"></a>
## [0.31.2](https://github.com/aurelia/cli/compare/0.31.1...0.31.2) (2017-08-25)


### Bug Fixes

* **deps:** update esprima to 4.0.0 ([48d2a48](https://github.com/aurelia/cli/commit/48d2a48))
* **favicon:** resolve favicon error in firefox ([01a5bb6](https://github.com/aurelia/cli/commit/01a5bb6))
* **jest:** resolve babel-jest error ([3cfd956](https://github.com/aurelia/cli/commit/3cfd956))
* **loader:** rev should be applied to bundle for systemjs ([691eec8](https://github.com/aurelia/cli/commit/691eec8))
* **watch:** resolve issue where changes are not detected ([9146da2](https://github.com/aurelia/cli/commit/9146da2))
* **watch:** support array of source files ([22a257e](https://github.com/aurelia/cli/commit/22a257e))
* **webpack:** clean dist folder before build ([053ad98](https://github.com/aurelia/cli/commit/053ad98))
* **webpack:** copy environment file on build ([b9c76e5](https://github.com/aurelia/cli/commit/b9c76e5))
* **webpack:** enable sourcemaps by default ([0525dca](https://github.com/aurelia/cli/commit/0525dca))
* **webpack:** pass env to webpack correctly ([4880c19](https://github.com/aurelia/cli/commit/4880c19))
* **webpack:** resolve typings issues ([efcbc27](https://github.com/aurelia/cli/commit/efcbc27))
* **webpack:** support au build --watch ([4d31ce7](https://github.com/aurelia/cli/commit/4d31ce7))



<a name="0.31.1"></a>
## [0.31.1](https://github.com/aurelia/cli/compare/0.31.0...0.31.1) (2017-08-19)


### Bug Fixes

* **webpack:** explicitly load the webpack typings ([2357a62](https://github.com/aurelia/cli/commit/2357a62))



<a name="0.31.0"></a>
# [0.31.0](https://github.com/aurelia/cli/compare/0.30.1...0.31.0) (2017-08-18)


### Bug Fixes

* **bundle:** support both Uglify v3 and v2. ([7b606ab](https://github.com/aurelia/cli/commit/7b606ab)), closes [#636](https://github.com/aurelia/cli/issues/636)
* **bundle:** support quoteless script src attribute ([ffafbc9](https://github.com/aurelia/cli/commit/ffafbc9)), closes [#639](https://github.com/aurelia/cli/issues/639)
* **bundler:** don't trace dependencies which have no main file ([a2cf32b](https://github.com/aurelia/cli/commit/a2cf32b)), closes [/github.com/aurelia/cli/issues/435#issuecomment-293850306](https://github.com//github.com/aurelia/cli/issues/435/issues/issuecomment-293850306)
* **dependencies:** update gulp-sass version ([75d331e](https://github.com/aurelia/cli/commit/75d331e))
* **dependencies:** update karma-chrome-launcher ([6719a2d](https://github.com/aurelia/cli/commit/6719a2d))
* **importer:** prevent duplicate dist ([a22dc3d](https://github.com/aurelia/cli/commit/a22dc3d))
* **systemjs-bundling:** include dependency name in bundle config ([d36f2ae](https://github.com/aurelia/cli/commit/d36f2ae)), closes [aurelia/cli#676](https://github.com/aurelia/cli/issues/676)


### Features

* **all:** add webpack ([2c08625](https://github.com/aurelia/cli/commit/2c08625))
* **sourcemaps:** inlcude sourcemaps in karma configuration ([ebd79e8](https://github.com/aurelia/cli/commit/ebd79e8)), closes [aurelia/cli#420](https://github.com/aurelia/cli/issues/420)



<a name="0.30.1"></a>
## [0.30.1](https://github.com/aurelia/cli/compare/0.30.0...v0.30.1) (2017-06-28)


### Bug Fixes

* **bundle:** continue build in case of incorrect sourcemap ([4988dd6](https://github.com/aurelia/cli/commit/4988dd6))
* **html-minify:** resolve parse error of interpolations ([b15199f](https://github.com/aurelia/cli/commit/b15199f))
* **systemjs-loader:** systemjs config for karma test runner ([adac051](https://github.com/aurelia/cli/commit/adac051)), closes [aurelia/cli#648](https://github.com/aurelia/cli/issues/648)



<a name="0.30.0"></a>
# [0.30.0](https://github.com/aurelia/cli/compare/0.29.0...v0.30.0) (2017-06-13)


### Bug Fixes

* **generators:** create elements/attributes in correct location ([7400e71](https://github.com/aurelia/cli/commit/7400e71))
* **html-minify:** ignore interpolation expressions ([803c904](https://github.com/aurelia/cli/commit/803c904))
* **package-analyzer:** infer index.js as main ([f5c0ed1](https://github.com/aurelia/cli/commit/f5c0ed1))
* **project:** only transpile aurelia_project in project root ([6fd3f7f](https://github.com/aurelia/cli/commit/6fd3f7f))


### Features

* **all:** systemjs support ([36fa685](https://github.com/aurelia/cli/commit/36fa685)), closes [aurelia/cli#198](https://github.com/aurelia/cli/issues/198)
* **build:** allow minify options to be supplied ([177b0c7](https://github.com/aurelia/cli/commit/177b0c7))



<a name="0.29.0"></a>
# [0.29.0](https://github.com/aurelia/cli/compare/0.28.0...v0.29.0) (2017-04-27)


### Bug Fixes

* **package-analyzer:** find location of packages outside of node_modules ([324f3e1](https://github.com/aurelia/cli/commit/324f3e1))


### Features

* **package-analyzer:** support packages without package.json files ([c225bb7](https://github.com/aurelia/cli/commit/c225bb7))



<a name="0.28.0"></a>
# [0.28.0](https://github.com/aurelia/cli/compare/0.27.0...v0.28.0) (2017-04-05)


### Bug Fixes

* **all:** improved error reporting ([4060148](https://github.com/aurelia/cli/commit/4060148))
* **build:** enforce strict mode ([1694290](https://github.com/aurelia/cli/commit/1694290))
* **bundle:** ensure that dependencies are added in order ([51a2cce](https://github.com/aurelia/cli/commit/51a2cce))
* **project-template:** paths should be relatively from src ([b23c8dd](https://github.com/aurelia/cli/commit/b23c8dd))
* **sourcemap:** use src as the sourceroot for sourcemaps ([87ca276](https://github.com/aurelia/cli/commit/87ca276))
* **test:** resolve join of undefined error ([0207c78](https://github.com/aurelia/cli/commit/0207c78))


### Features

* **index.html:** add viewport meta element ([96ce8a9](https://github.com/aurelia/cli/commit/96ce8a9))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/aurelia/cli/compare/0.26.1...v0.27.0) (2017-03-25)


### Bug Fixes

* **bluebird:** remove unnecessary Bluebird config in main file ([6fb5ee2](https://github.com/aurelia/cli/commit/6fb5ee2)), closes [#534](https://github.com/aurelia/cli/issues/534)
* **build:** ensure that dependencies get in the correct bundle ([f4c9e8f](https://github.com/aurelia/cli/commit/f4c9e8f))
* **file-system/logger:** don't use spread operator to support nodejs 4 ([ed6eb25](https://github.com/aurelia/cli/commit/ed6eb25))
* **importer:** search for css files in root dir and resolve import error ([9a0da9e](https://github.com/aurelia/cli/commit/9a0da9e))
* **project-template:** set baseDir to '.wwwroot' for ASP.NET Core projects ([c1e0401](https://github.com/aurelia/cli/commit/c1e0401))
* **run:** don't ignore browserSync errors ([6518279](https://github.com/aurelia/cli/commit/6518279))
* **test:** esling reports error that path should never be concated as string ([2b3f442](https://github.com/aurelia/cli/commit/2b3f442))
* **typescript:** do not build typescript files in aurelia_project folder ([334df2f](https://github.com/aurelia/cli/commit/334df2f))


### Features

* **tests:** Enabled unit testing ([19c59a1](https://github.com/aurelia/cli/commit/19c59a1))



## 0.26.1

* Fix/base64 sourcemap

## 0.26.0

* Fix minor bug in hashed bundles.

## 0.25.0

### Notes for upgrading to 0.25.0

We have removed the code for configuring Bluebird from `main.[js|ts]`. This code has been moved to a file that is now prepended to `vendor-bundle.js`. You will need to update the `prepend` section of your `vendor-bundle.js` configuration to start with the following two files:

```json
"prepend": [
  "node_modules/bluebird/js/browser/bluebird.core.js",
  "node_modules/aurelia-cli/lib/resources/scripts/configure-bluebird.js",
```

### Features

So much stuff!

* au import command
* au install command
* huge performance improvements to building/bundling.

### Bugs

Lots of bugs fixed all over the place. Oh my!

This change will remove the errors seen when running an Aurelia CLI app in Firefox, Edge, or IE.

## 0.24.0

### Features

* **typescript:** set lib to es2017 for upcoming js features
* **new command:** enable configuration of html minification

### Bug Fixes

* **transform:** enable wrap shim for shimmed definitions
* **build:** update babel presets to avoid deprecated module
* **package-analyzing:** allow deeper levels for source root
* **src/main:** remove bluebird config that causes Edge issue

## 0.23.0

### Features

* Add a "None of the above" choice for the Editor step in the `new` wizard
* **settings.json:** disable ionic html tags

### Bug Fixes

* **transpile:** create tsProj every time to avoid crashing
* **sourcemaps:** stop adding non-existent sourcemaps to sourcemap

### Notes for Upgrading from `<= 0.21.0` Versions of CLI

Version `0.22.0` of the CLI made changes to the `aurelia.json` file. This release has fixed issues with source maps; however, these changes require users who are upgrading existing projects to make the following tweaks to their `aurelia.json` file to enjoy these fixes:

* replace all instances of `\\` with `/` in file paths
* replace `"scripts/require.js"` with `node_modules/requirejs/require.js"`
* the `text` dependency in the `vendor-bundle.js` dependencies is an object literal as shown below. It should be replaced with just the string `"text"`.

So this:

```javascript
{
   "text",
   "name": "text",		
   "path": "../scripts/text"		
}
```

becomes this:

```javascript
"text"
```

After making the above changes to `aurelia.json`, run `npm install requirejs requirejs/text --save` from the project directory.

## 0.22.0

### Bug Fixes

**index.html:** ensure charset is added to html page
**build** Fix #382 by catching errors with gulp-plumber
**file-paths:** don't use windows style path separators

### Features

* **autocomplete:** disable built-in Angular1 auto-complete/ suggest
* **main:** only use bluebird long stack traces during debug mode
* **build** move require and text to external module

## 0.21.0

### Bug Fixes

* **dependency-inclusion:** wait until all resources are traced before bundling
* **aurelia-karma:** make it compatible with PhantomJS

### Features

* **bundler, bundle:** abstract out loader config generator

## 0.20.2

### Bug Fixes

* **package-analyzer:** correct resolution of scoped package path

## 0.20.0

### Features

* Support bundle revision numbers.
* Support arbitrary module loader configuration.

### Bug Fixes

* Don't add .vscode settings unless the VS Code editor is selected.
* Update NPM dependency to prevent event emitter warnings.
* Use path.root for Karma tests
* Always ensure directory structure exists before creating files
* Erroneous source module inclusing resulting in empty/broken bundled modules

## 0.19.0

* feat(cli): add exit error code
* feat(bundle,source-inclusion): allow `exclude` option in bundle source

## 0.18.0

* feat(dependency-description): enable direct pathing to standard files
* fix(package-analyzer): dependency package location no longer tied to name
* fix(package-analyzer): ensure path splits across potential plat differences
* feat(project): configure all paths as project items

## 0.17.0

* feat(bundle): add an option to use absolute path in requirejs

## 0.16.2

* fix(source-inclusion): incorrect module ids on windows

## 0.16.1

* fix(source-inclusion): move dependency

## 0.16.0

* feat(bundler): enable dependencies to include additional resources

## 0.15.0

* feat(bundler): add support for shims via deps and exports

## 0.14.0

* fix(aspnet): correctly configure base url

## 0.13.10

* fix(run): manually log ports to avoid browser sync color issues
* feat(new-application): better prompts and default values
* fix(ui): enable typing option labels
* fix(cli-options): enable handling of single dash mistakes as fallback
* fix(resources): ensure empty lines at ends of files
* feat(pug): begin the implementation of pug markup support (not yet available)
* feat(new): enable --here to pick up name from folder
* feat(new): make here projects always custom and start with platform selection
* fix(bundles-source): ensure module ids on all bundled items
