# Descriptive Skeleton

aurelia-cli's skeleton generation has been fully descriptive, it means you don't need to write explicit code for scaffolding.

To add a new feature to app skeleton, following these 3 steps.

1. add a new question, or add new choice to an existing question, in `lib/workflow/questionnaire.js`.
2. if new question is added, add it into `appFlow` at the bottom of `lib/workflow/select-features.js`. You may need to update its test code in `spec/lib/workflow/select-features.spec.js`.
3. write descriptive skeleton in `skeleton/` folder.

## Explanation on app features

All our "features" (webpack, or sass, or http2) are represented as simple string (`'webpack'`, `'sass'`, `'http2'`). There is no distinguish between them, no need with descriptive skeleton in place.

## Explanation on the `skeleton/`

The `skeleton/` folder is organized based on features.

1. `skeleton/common/` folder is special, it's included for every app.
2. some features have their dedicated folder like `skeleton/cli-bundler/` and `skeleton/webpack/`. But not all features need a dedicated folder, it depends on how complex the feature is. It's your choice on whether to create a dedicated folder for a new feature.
3. every sub-folder in `skeleton/` provides a partial app skeleton. Aurelia-cli will merge them all together to create the final app.

## Conditional files or contents

There are few ways to conditionally include a file or part of the file.

1. we learnt from above, the sub-folder in `skeleton/` is the first condition applied on features.
2. within the sub-folder, you can use suffix on any file, like `common/.babbelrc.js__if_babel`.
3. similarly, you can apply suffix on any deep folder too, like `scaffold-minimum/test__if_karma_or_jest/`. Note the condition `karma_or_jest`, you can use `and`/`or`/`not` in the condition expression, the example will be translated as `karma || jest`.
4. within any file, you can use [preprocess syntax](https://github.com/jsoverson/preprocess) to conditionally write part of the contents.
5. one more convention, if you name a file with extname `.ext`, like `app.ext`, it will yield to `app.js` or `app.ts` depending on whether user chose TypeScript.

Simply enough? Have a look of the `skeleton/` folder, it's intuitive to follow.

It's very flexible, for example, there are three folders within `skeleton/cli-bundler/aurelia_project/` folder:
```
tasks/
tasks__if_babel/
tasks__if_typescript
```
They will be merged together based on user selection.

## Write policy

This is designed mainly for dotnet and `au new --here` when there is existing file in target folder.

1. you can use suffix `__skip-if-exists`, `__append-if-exists`, `__ask-if-exists` on any file (not folder).
2. you can fix write policy suffix with conditional suffix in any order, it's same to write `file.ext__skip-if-exists__if_babel` or `file.ext__if_babel__skip-if-exists`.
3. you can provide an instructions file for any file with `__skip-if-exists`. If the file is skipped, the instructions will be printed out on screen, also be written to file `instructions.txt` in final app. For instance, `skeleton/dotnet-core/Views/Home/Index.cshtml__instructions` for `skeleton/dotnet-core/Views/Home/Index.cshtml__skip-if-exists`.

## Three special files

There are three special files in `skeleton/`:

1. `package.json` obviously, there are multiple `package.json` in various `skeleton/` sub-folders. They will be merged to together obviously. Recommended, if you leave dependency version as empty string `"aurelia-cli": ""`, cli will use `lib/dependencies.json` to fill up the version.
2. `aurelia_project/aurelia.json`, similar to above.
3. `README.md` files, they are concatenated together.
