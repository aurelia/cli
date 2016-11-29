## 0.23.0
### Notes for upgrading from `<= 0.21.0` versions of CLI
Version `0.22.0` of the CLI made changes to the `aurelia.json` file. This release has fixed issues with source maps; however, these changes require users who are upgrading existing projects to make the following tweaks to their `aurelia.json` file to enjoy these fixes:
- replace all instances of `\\` with `/` in file paths
- replace `"scripts/require.js"` with `node_modules/requirejs/require.js"`
- the `text` dependency in the `vendor-bundle.js` dependencies is an object literal as shown below. It should be replaced with just the string `"text"`
```javascript
{
   "text",
   "name": "text",		
   "path": "../scripts/text"		
}
```

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
