# [1.0.0-beta.14](https://github.com/aurelia/cli/compare/1.0.0-beta.13...1.0.0-beta.14) (2019-03-20)


### Bug Fixes

* **bundler:** avoid unnecessary rewrite of index.html ([9faea2f](https://github.com/aurelia/cli/commit/9faea2f)), closes [#1049](https://github.com/aurelia/cli/issues/1049)
* **bundler:** enable tracing @babel/polyfill ([1bef893](https://github.com/aurelia/cli/commit/1bef893))
* **bundler:** improve compatibility with legacy libs that depends on jquery or momentjs ([cd079a0](https://github.com/aurelia/cli/commit/cd079a0))
* **bundler:** improve compatibility with nodejs global var "global" ([02d1cd0](https://github.com/aurelia/cli/commit/02d1cd0))
* **bundler:** isolate cache between systemjs and requirejs apps ([5466ceb](https://github.com/aurelia/cli/commit/5466ceb))
* **bundler:** skip deps cleanup (remove .js) for UMD file ([a4731da](https://github.com/aurelia/cli/commit/a4731da)), closes [#1054](https://github.com/aurelia/cli/issues/1054)
* **cypress task:** Return error when tests fail ([ea43b59](https://github.com/aurelia/cli/commit/ea43b59))
* **cypress task:** Return error when tests fail ([7fa7e9e](https://github.com/aurelia/cli/commit/7fa7e9e)), closes [#1057](https://github.com/aurelia/cli/issues/1057)
* **generate-skeletons:** add missing httpProtocal to project definitions ([bab0e39](https://github.com/aurelia/cli/commit/bab0e39))
* **jest task:** Return error when tests fail ([bfbe072](https://github.com/aurelia/cli/commit/bfbe072)), closes [#1052](https://github.com/aurelia/cli/issues/1052)
* **jest task:** Return error when tests fail ([830bda8](https://github.com/aurelia/cli/commit/830bda8))
* **skeleton:** fix navigation scaffold with alameda ([9413239](https://github.com/aurelia/cli/commit/9413239))
* **sourcemaps:** strip path from bundle sourcemap ([8601622](https://github.com/aurelia/cli/commit/8601622))
* **webpack:** correctly exclude spec/test files from coverage report ([b2582f9](https://github.com/aurelia/cli/commit/b2582f9))


### Features

* **generate-skeletons:** add alameda to generate-skeletons ([0147567](https://github.com/aurelia/cli/commit/0147567))
* **integration-test-runner:** Add Cypress ([4b5919a](https://github.com/aurelia/cli/commit/4b5919a))
* **integration-test-runner:** Add Cypress ([77c6f60](https://github.com/aurelia/cli/commit/77c6f60))
* **integration-test-runner:** Add Cypress ([1ece72e](https://github.com/aurelia/cli/commit/1ece72e))
* **integration-test-runner:** Add Cypress ([f2eb6c5](https://github.com/aurelia/cli/commit/f2eb6c5))
* **integration-test-runner:** Add Cypress ([21ac3db](https://github.com/aurelia/cli/commit/21ac3db))
* **new-application:** fix format on log messages ([6d6fcea](https://github.com/aurelia/cli/commit/6d6fcea))
* **test:** Add Cypress integration test runner ([cabe6ce](https://github.com/aurelia/cli/commit/cabe6ce)), closes [#943](https://github.com/aurelia/cli/issues/943)
* **ui:** add Enquirer as UI lib ([f05da1a](https://github.com/aurelia/cli/commit/f05da1a))
* unattended mode, descriptive skeleton ([0123c58](https://github.com/aurelia/cli/commit/0123c58))



# [1.0.0-beta.13](https://github.com/aurelia/cli/compare/1.0.0-beta.12...1.0.0-beta.13) (2019-02-05)


### Bug Fixes

* **jest:** avoid aurelia-bindings v1+v2 conflict ([7863c29](https://github.com/aurelia/cli/commit/7863c29)), closes [#906](https://github.com/aurelia/cli/issues/906)
* **webpack:** revert [#970](https://github.com/aurelia/cli/issues/970) to restore default webpack module resolution ([3c4d0d6](https://github.com/aurelia/cli/commit/3c4d0d6)), closes [#1037](https://github.com/aurelia/cli/issues/1037)


### Features

* **new-application:** add scaffolding feature for navigation skeleton ([ea4ce1a](https://github.com/aurelia/cli/commit/ea4ce1a))
* **new-application:** add scaffolding feature for navigation skeleton ([b918ac3](https://github.com/aurelia/cli/commit/b918ac3))
* **requirejs/systemjs:** add protractor and jest support ([148148c](https://github.com/aurelia/cli/commit/148148c))



# [1.0.0-beta.12](https://github.com/aurelia/cli/compare/1.0.0-beta.11...1.0.0-beta.12) (2019-01-26)


### Features

* **find-deps:** add build tracing for import elements ([0b9f740](https://github.com/aurelia/cli/commit/0b9f740))



# [1.0.0-beta.11](https://github.com/aurelia/cli/compare/1.0.0-beta.10...1.0.0-beta.11) (2019-01-23)


### Bug Fixes

* **bundler:** fix conventional html view dependency with SystemJS ([ae249ca](https://github.com/aurelia/cli/commit/ae249ca)), closes [#1023](https://github.com/aurelia/cli/issues/1023)
* **bundler:** tolerant js with missing ending semicolon ([90d247d](https://github.com/aurelia/cli/commit/90d247d)), closes [#1021](https://github.com/aurelia/cli/issues/1021)



# [1.0.0-beta.10](https://github.com/aurelia/cli/compare/1.0.0-beta.9...1.0.0-beta.10) (2019-01-19)


### Bug Fixes

* **alameda:** Tests could not load files by path ([68b3ffa](https://github.com/aurelia/cli/commit/68b3ffa))
* **bundler:** fix plugin prefix/subfix regex match ([f8266f3](https://github.com/aurelia/cli/commit/f8266f3))
* **bundler:** tolerant missing main file, fix tracing on simple-line-icons ([9ad9eb5](https://github.com/aurelia/cli/commit/9ad9eb5))
* **jasmine:** Updated aurelia-karma to get rid of deprecation error ([1fbe99a](https://github.com/aurelia/cli/commit/1fbe99a))


### Features

* **bundler:** support direct css import in js file ([2de02d2](https://github.com/aurelia/cli/commit/2de02d2))
* **bundler:** support module resolution for lerna hoisting ([dabc8b9](https://github.com/aurelia/cli/commit/dabc8b9))



# [1.0.0-beta.9](https://github.com/aurelia/cli/compare/1.0.0-beta.8...1.0.0-beta.9) (2018-12-29)


### Bug Fixes

* **bundler:** fix stubbing on core Nodejs module "stream" ([1e36774](https://github.com/aurelia/cli/commit/1e36774))



# [1.0.0-beta.8](https://github.com/aurelia/cli/compare/1.0.0-beta7...1.0.0-beta.8) (2018-12-19)


### Bug Fixes

* **cli:** add typings for bluebird ([215c3e0](https://github.com/aurelia/cli/commit/215c3e0)), closes [#991](https://github.com/aurelia/cli/issues/991)
* **cli:** add typings for bluebird ([0a629cd](https://github.com/aurelia/cli/commit/0a629cd)), closes [#991](https://github.com/aurelia/cli/issues/991)
* **run-webpack.js run-webpack.ts index-webpack.ejs:** update run scripts, remove redundant entry in index template ([9b3c171](https://github.com/aurelia/cli/commit/9b3c171))
* avoid early exist of "au new" ([be532fd](https://github.com/aurelia/cli/commit/be532fd)), closes [#977](https://github.com/aurelia/cli/issues/977)


### Features

* **webpack:** Improvements in CLI generated Webpack config ([2365331](https://github.com/aurelia/cli/commit/2365331))



# [1.0.0-beta.7](https://github.com/aurelia/cli/compare/1.0.0-beta.6...1.0.0-beta.7)


### Bug Fixes

* fresh build of package-lock.json to remove malicious flatmap-stream ([9948864](https://github.com/aurelia/cli/commit/9948864))



<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/aurelia/cli/compare/1.0.0-beta.5...1.0.0-beta.6) (2018-11-19)


### Bug Fixes

* **bundler:** use topological sort to ensure shim order ([6721519](https://github.com/aurelia/cli/commit/6721519)), closes [#955](https://github.com/aurelia/cli/issues/955)
* **webpack.config.template.js:** monorepo resolve root only ([a3fdc94](https://github.com/aurelia/cli/commit/a3fdc94))



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/aurelia/cli/compare/1.0.0-beta.4...1.0.0-beta.5) (2018-11-15)


### Bug Fixes

* **bundler:** fix unstable sorting for shim modules ([c702325](https://github.com/aurelia/cli/commit/c702325)), closes [#955](https://github.com/aurelia/cli/issues/955)
* **bundler:** Revisions are inserted into platform.index for all bundles ([435557c](https://github.com/aurelia/cli/commit/435557c))
* **generator:** fix babel syntax error when running "au generate" ([8eb19e7](https://github.com/aurelia/cli/commit/8eb19e7)), closes [#954](https://github.com/aurelia/cli/issues/954)
* **webpack:** compile hook issue with output ([a9dd926](https://github.com/aurelia/cli/commit/a9dd926))
* **webpack.config.template.js:** change webpack config to fix bundle duplication issue ([6996274](https://github.com/aurelia/cli/commit/6996274))


### Features

* **bundler:** bundle json files by default for app skeletons of cli bundler ([6b3c53e](https://github.com/aurelia/cli/commit/6b3c53e))
* **esnext:** use babel polyfill to enable async/await syntax for esnext projects ([2fe31f5](https://github.com/aurelia/cli/commit/2fe31f5)), closes [#959](https://github.com/aurelia/cli/issues/959)



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/aurelia/cli/compare/1.0.0-beta.3...1.0.0-beta.4) (2018-11-07)


### Bug Fixes

* **package-analyzer:** ignore module field for 'aurelia-' packages ([00de202](https://github.com/aurelia/cli/commit/00de202))
* **package-analyzer-test:** fix lint issues, adjust assertion ([abb0145](https://github.com/aurelia/cli/commit/abb0145))



<a name="1.0.0-beta.3"></a>
# [1.0.0](https://github.com/aurelia/cli/compare/1.0.0-beta.2...1.0.0-beta.3) (2018-10-17)


### Bug Fixes

* **bundler:** bypass a nasty terser compress bug by using fast-minify-mode ([7a37238](https://github.com/aurelia/cli/commit/7a37238)), closes [#928](https://github.com/aurelia/cli/issues/928)
* **bundler:** support nodejs subfolder package.json ([eef51f0](https://github.com/aurelia/cli/commit/eef51f0))
* **webpack:** use webpack4 hook that replaced deprecated plugin api ([8b5d732](https://github.com/aurelia/cli/commit/8b5d732)), closes [#923](https://github.com/aurelia/cli/issues/923)



<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/aurelia/cli/compare/1.0.0-beta.1...1.0.0-beta.2) (2018-10-14)


### Bug Fixes

* fix html5 syntax ([09cbb63](https://github.com/aurelia/cli/commit/09cbb63)), closes [/github.com/aurelia/templating/pull/647#issuecomment-427989601](https://github.com//github.com/aurelia/templating/pull/647/issues/issuecomment-427989601)
* **bundler:** be resilient on malformed main/module/browser fields in package.json ([3a2143c](https://github.com/aurelia/cli/commit/3a2143c)), closes [#934](https://github.com/aurelia/cli/issues/934)
* **bundler:** fix a regression on missing yaml file for some users ([4387bff](https://github.com/aurelia/cli/commit/4387bff)), closes [#930](https://github.com/aurelia/cli/issues/930)


### Features

* upgrade to babel7 ([35946b3](https://github.com/aurelia/cli/commit/35946b3)), closes [#846](https://github.com/aurelia/cli/issues/846)



<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/aurelia/cli/compare/0.35.1...1.0.0-beta.1) (2018-10-08)


### Bug Fixes

* fix exception on "au new" when running directly in root directory ([8037eef](https://github.com/aurelia/cli/commit/8037eef))


### Features

* **bundler:** auto tracing for requirejs/systemjs ([c4ce02c](https://github.com/aurelia/cli/commit/c4ce02c)), closes [#831](https://github.com/aurelia/cli/issues/831) [#853](https://github.com/aurelia/cli/issues/853) [#842](https://github.com/aurelia/cli/issues/842) [#831](https://github.com/aurelia/cli/issues/831)
* **bundler:** build.options.cache turn on tracing cache and transpile cache ([15af83f](https://github.com/aurelia/cli/commit/15af83f))
* **bundler:** fully support package.json browser field ([5bb81d4](https://github.com/aurelia/cli/commit/5bb81d4)), closes [#579](https://github.com/aurelia/cli/issues/579) [#581](https://github.com/aurelia/cli/issues/581)
* **bundler:** stub core Node.js modules just like browserify and webpack ([19aafee](https://github.com/aurelia/cli/commit/19aafee))
* **bundler:** support both 'json!f.json' and 'f.json' module id. ([ea005fe](https://github.com/aurelia/cli/commit/ea005fe))
* **bundler:** support Node.js direct json loading require("foo.json") ([8fa8800](https://github.com/aurelia/cli/commit/8fa8800))
* **bundler:** support npm package shipped in native es module ([1669a6f](https://github.com/aurelia/cli/commit/1669a6f)), closes [#872](https://github.com/aurelia/cli/issues/872)
* **bundler:** support onRequiringModule(moduleId) callback ([fd49eb1](https://github.com/aurelia/cli/commit/fd49eb1))
* **bundler:** support per package wrapShim setting on dependency config ([3c796ac](https://github.com/aurelia/cli/commit/3c796ac))
* **bundler:** use package.json "module" (es module format) over "main" ([a3bc63a](https://github.com/aurelia/cli/commit/a3bc63a))


### BREAKING CHANGES

* **bundler:** require minor user code change to support non-js main, like "main": "font-awesome.css"
* **bundler:** remove support of undocumented "main": false, replace with generic "lazyMain": true. But this is handled transparently without breaking user's existing app.



<a name="0.35.1"></a>
## [0.35.1](https://github.com/aurelia/cli/compare/0.35.0...0.35.1) (2018-09-25)


### Bug Fixes

* fix regression, panic on missing yarn ([ef39841](https://github.com/aurelia/cli/commit/ef39841))



<a name="0.35.0"></a>
# [0.35.0](https://github.com/aurelia/cli/compare/0.34.0...0.35.0) (2018-09-18)


### Bug Fixes

* fix environment check (--env or NODE_ENV) ([c706c81](https://github.com/aurelia/cli/commit/c706c81)), closes [#912](https://github.com/aurelia/cli/issues/912)
* fix regression on npm/yarn path when it has white space ([3641a92](https://github.com/aurelia/cli/commit/3641a92))


### Features

* upgrade to babel-preset-env ([1afe47f](https://github.com/aurelia/cli/commit/1afe47f)), closes [#754](https://github.com/aurelia/cli/issues/754) [#909](https://github.com/aurelia/cli/issues/909)



<a name="0.34.0"></a>
# [0.34.0](https://github.com/aurelia/cli/compare/0.33.1...0.34.0) (2018-08-09)


### Bug Fixes

* **bundler:** fix compatibility with source-map >= v0.6 ([681a77d](https://github.com/aurelia/cli/commit/681a77d)), closes [#870](https://github.com/aurelia/cli/issues/870)
* **cli:** default bundler is webpack, so move to position 1 ([d0ff2ee](https://github.com/aurelia/cli/commit/d0ff2ee))
* **cli:** display meanful error when not installed locally ([71893be](https://github.com/aurelia/cli/commit/71893be))
* **cli:** fail gracefully when installed in parent folder ([9407c87](https://github.com/aurelia/cli/commit/9407c87))
* **cli:** no longer clear the terminal ([9644da8](https://github.com/aurelia/cli/commit/9644da8))
* **cli build:** reassign global.define.amd after assigning karma override function ([9eee46f](https://github.com/aurelia/cli/commit/9eee46f)), closes [#71](https://github.com/aurelia/cli/issues/71)
* **importer:** support nodejs module default main file "index.js" when "main" is missing in package.json ([e050868](https://github.com/aurelia/cli/commit/e050868)), closes [#831](https://github.com/aurelia/cli/issues/831)
* **install:** leave yarn/npm up to the user ([cce5070](https://github.com/aurelia/cli/commit/cce5070))
* **jest:** update usage of jest.runCli ([66799c0](https://github.com/aurelia/cli/commit/66799c0)), closes [#896](https://github.com/aurelia/cli/issues/896)
* **npm:** update internal npm ([987cc68](https://github.com/aurelia/cli/commit/987cc68))
* **package-scripts:** fix test.lint.fix task ([76816e9](https://github.com/aurelia/cli/commit/76816e9))
* **package.json:** added missing deps ([54f14be](https://github.com/aurelia/cli/commit/54f14be))
* **requirejs/systemjs:** fix duplicate index.html ([8bac73d](https://github.com/aurelia/cli/commit/8bac73d))
* enforce single aurelia-binding in webpack bundle ([911b3d7](https://github.com/aurelia/cli/commit/911b3d7))
* fix binary file copy on favicon.ico ([f7941f4](https://github.com/aurelia/cli/commit/f7941f4)), closes [#688](https://github.com/aurelia/cli/issues/688)
* **run-webpack.ts:** copy the https property from devServer to opts ([118e441](https://github.com/aurelia/cli/commit/118e441))
* **stylus:** don't stop watch on error ([4ad96fd](https://github.com/aurelia/cli/commit/4ad96fd))
* **tsconfig.template.json:** fix incorrect files glob ([ca0ab4b](https://github.com/aurelia/cli/commit/ca0ab4b))
* **webpack:** remove json loader from webpack config ([0ef0b84](https://github.com/aurelia/cli/commit/0ef0b84)), closes [#860](https://github.com/aurelia/cli/issues/860)


### Features

* **requirejs/systemjs:** add protractor and jest support ([4648877](https://github.com/aurelia/cli/commit/4648877))
* check duplicated packages in webpack ([bd69e5e](https://github.com/aurelia/cli/commit/bd69e5e)), closes [aurelia/binding#702](https://github.com/aurelia/binding/issues/702)
* use terser to replace uglifyjs for better es6 support ([588ce58](https://github.com/aurelia/cli/commit/588ce58)), closes [#883](https://github.com/aurelia/cli/issues/883) [#490](https://github.com/aurelia/cli/issues/490) [#864](https://github.com/aurelia/cli/issues/864)



<a name="0.33.0"></a>
# [0.33.0](https://github.com/aurelia/cli/compare/0.32.0...0.33.0) (2018-03-16)


### Bug Fixes

* **bundle:** sort bundle files by path ([77697b1](https://github.com/aurelia/cli/commit/77697b1))
* **dependencies:** add jest-matchers for karma tests using webpack ([83c8bcf](https://github.com/aurelia/cli/commit/83c8bcf))
* **gitignore:** track vscode workspace files ([14f9bdd](https://github.com/aurelia/cli/commit/14f9bdd))
* **importer:** support scoped packages ([859df5b](https://github.com/aurelia/cli/commit/859df5b))
* **javascriptservices:** update configuration to set public path for static resources ([21e8a27](https://github.com/aurelia/cli/commit/21e8a27)), closes [#741](https://github.com/aurelia/cli/issues/741)
* **jest:** update aurelia-pal-nodejs ([578f400](https://github.com/aurelia/cli/commit/578f400))
* **rjs-ts:** add baseUrl to tsconfig ([ac020a1](https://github.com/aurelia/cli/commit/ac020a1))


### Features

* **build:** add support for external modules ([fc5f197](https://github.com/aurelia/cli/commit/fc5f197)), closes [#802](https://github.com/aurelia/cli/issues/802)
* **bundle:** sort module ids ([5ed65ce](https://github.com/aurelia/cli/commit/5ed65ce))
* **cli-bundler:** add --open flag ([23fc079](https://github.com/aurelia/cli/commit/23fc079))
* **new:** switch default to webpack ([15b1f1f](https://github.com/aurelia/cli/commit/15b1f1f))
* **vscode:** karma debug profile ([9911d4d](https://github.com/aurelia/cli/commit/9911d4d))
* **webpack:** add analyze flag to enable webpack bundle analyzer ([6ac3260](https://github.com/aurelia/cli/commit/6ac3260))
* **webpack:** update to webpack 4 ([5838e15](https://github.com/aurelia/cli/commit/5838e15))



<a name="0.32.0"></a>
# [0.32.0](https://github.com/aurelia/cli/compare/0.31.3...0.32.0) (2017-10-23)


### Bug Fixes

* **bundle:** exclude source-maps when applicable ([d94629f](https://github.com/aurelia/cli/commit/d94629f))
* **cli:** add VSCode Chrome Debugger to RequireJS/SystemJS ([3f4efd9](https://github.com/aurelia/cli/commit/3f4efd9))
* **generator-ts:** use .ts ending in template ([c10061f](https://github.com/aurelia/cli/commit/c10061f))
* **importer:** search for resources from package dist ([71ad598](https://github.com/aurelia/cli/commit/71ad598))
* **importer:** throw clear unsupported error for webpack projects ([5b23897](https://github.com/aurelia/cli/commit/5b23897))
* **javascriptservices:** update for .net core 2.0 ([f41af63](https://github.com/aurelia/cli/commit/f41af63))
* **jsconfig:** only create jsconfig for babel+vscode ([173898c](https://github.com/aurelia/cli/commit/173898c))
* **npm script:** add required dependency to start npm task ([de33698](https://github.com/aurelia/cli/commit/de33698))
* **tasks:** copy lint task to scaffolded app ([e16c216](https://github.com/aurelia/cli/commit/e16c216))
* **webpack:** add tslint config ([668b2fb](https://github.com/aurelia/cli/commit/668b2fb))
* **webpack:** linux case sensitivity ([2b2d3ce](https://github.com/aurelia/cli/commit/2b2d3ce))
* **webpack:** uglify by default for production builds ([0732294](https://github.com/aurelia/cli/commit/0732294))


### Features

* **cli:** add `au config` command ([5cd16f6](https://github.com/aurelia/cli/commit/5cd16f6)), closes [aurelia/cli#629](https://github.com/aurelia/cli/issues/629)
* **source-maps:** bundling improvements ([abeba3d](https://github.com/aurelia/cli/commit/abeba3d)), closes [aurelia/cli#659](https://github.com/aurelia/cli/issues/659) [aurelia/cli#624](https://github.com/aurelia/cli/issues/624)
* **tasks:** add lint tasks ([596442a](https://github.com/aurelia/cli/commit/596442a))
* **yarn:** use yarn to install deps if possible ([460887e](https://github.com/aurelia/cli/commit/460887e))



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
