# Descriptive Skeleton

The aurelia-cli offers loads of features out of the box, such as webpack, http2, sass and more. In this document you can find information on how to add new features. Don't worry, it's as easy as moving files or templates into a directory, something we call "descriptive skeletons".

To add a new feature, follow these 3 steps.

1. Add a new question to `au new` or extend existing questions by adding new options. This can all be done in the file `lib/workflow/questionnaire.js`.
2. New questions must be registered to `appFlow` in the `lib/workflow/select-features.js` file. You may need to update the test code in `spec/lib/workflow/select-features.spec.js`.
3. Add source files or templates to the `skeleton/` folder. More information on how to do this can be found below.

## Explanation on features

All the "features" of the aurelia-cli (webpack, or sass, or http2) are represented as simple strings (`'webpack'`, `'sass'`, `'http2'`).

## Explanation on the `skeleton/` folder

The `skeleton/` folder is organized in feature folders.

1. The `skeleton/common/` folder is special, since it's included in every app.
2. Some features have their dedicated folder like `skeleton/cli-bundler/` and `skeleton/webpack/`. Not all features need a dedicated folder though, it depends on how complex the feature is. It's your choice on whether to create a dedicated folder for a new feature or to use existing ones.
3. Every sub-folder in the `skeleton/` folder provides a partial application skeleton. The aurelia-cli will merge them all together to create the final application.

## Conditional files, folders or contents

There are few ways to conditionally include a file or folder. This is done by giving files a specific, structured name. Files can be templates, allowing you to conditionally add parts to a file.

Here are some tips:

1. As described earlier, all files of features belong inside the `skeleton/` folder.
2. Within the `skeleton/` folder, you can apply a suffix to any file name, such as `common/.babbelrc.js__if_babel`.
3. Similarly, you can apply a suffix on any folder as well, such as `scaffold-minimum/test__if_karma_or_jest/`. Note the condition `karma_or_jest`. You can use `and`/`or`/`not` in the condition expression. The example will be interpreted as `karma || jest`.
4. Within any file, you can use [preprocess syntax](https://github.com/jsoverson/preprocess) to add (or omit) parts of the file.
5. When a file is given an extension of `.ext`, like `app.ext`, it will ultimately be translated into `app.js` or `app.ts` depending on whether user chose TypeScript.

Need some examples? Have a look of the `skeleton/` folder, there are lots of features in there already.

Because of the conventions described above, the scaffolding system is very flexible. For example, there are three folders within `skeleton/cli-bundler/aurelia_project/` folder:
```
tasks/
tasks__if_babel/
tasks__if_typescript
```
Folder contents will be merged together based on what options the user has selected.

## Write policy

This is designed mainly for dotnet and `au new --here` when there is an existing file in the target folder.

1. You can use the suffix `__skip-if-exists`, `__append-if-exists`, `__ask-if-exists` on any file (not folder).
2. You can mix write policy suffix with conditional suffix in any order. For example, `file.ext__skip-if-exists__if_babel` is equivalent to `file.ext__if_babel__skip-if-exists`.
3. You can provide an instructions file for any file with `__skip-if-exists`. If the file is skipped, the instructions will be printed out on screen and will also be written to file `instructions.txt` in the final app. Some existing examples are `skeleton/dotnet-core/Views/Home/Index.cshtml__instructions` and `skeleton/dotnet-core/Views/Home/Index.cshtml__skip-if-exists`.

## Three special files

There are three special files in `skeleton/`:

1. `package.json`: there are multiple `package.json` in various `skeleton/` sub-folders. They will be merged to together. The recommendation is to leave dependency versions as empty strings `"aurelia-cli": ""`. The CLI will use `lib/dependencies.json` to determine which version to use for the dependency.
2. `aurelia_project/aurelia.json`: similarly to the `package.json` file, `aurelia.json` files will also be merged together.
3. `README.md` files are concatenated together.
