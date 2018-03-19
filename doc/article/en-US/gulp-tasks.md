---
name: Gulp Tasks
description: Gulp tasks using the Aurelia CLI.
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## Introduction

The Aurelia CLI allows you to execute Gulp tasks, and a few gulp tasks are provided out of the box that get you started. For any new project you need a task to build, run and test the application, so the CLI provides these tasks for you. These tasks can be found in the `aurelia_project/tasks` directory.

Gulp tasks in a CLI application are plain Gulp v4 tasks. Gulp v4 brings gulp.series and gulp.parallel which makes Gulp tasks easier and cleaner.

Typescript is entirely supported to be used in Gulp tasks. As is ES2017. The language you use in Gulp tasks is equivalent to the language in your source code and is determined from the `transpiler` object in `aurelia.json`.

## Task execution
A task can be executed with the `au` command. `au build` would execute the Gulp task that's exported from `aurelia_project/tasks/build.js`, and `au test` executes the task that's in `aurelia_project/tasks/test.js`.

What's good to know is that the Aurelia CLI executes the task that's exported as default, which means that you can export multiple tasks: 

<code-listing heading="Export multiple tasks">
  <source-code lang="JavaScript">
	let task1 = () => {};
	let task2 = () => {};
	
	export { task1 as default, task2 };
  </source-code>
</code-listing>

When you execute the above task using the `au` command, `task1` will be executed.

## Creating a new task
Cool thing about the task runner of the CLI is that you can create your own tasks as well, and run them using the `au` command. 

Just create a new `.js` or `.ts` file in the `aurelia_project/tasks` directory and export a function from that file.


## Task metadata
The `au help` command not only shows standard Aurelia CLI commands, it also lists tasks, but only those that have defined what we call "task metadata". This metadata can be found in a `.json` file that has the same name as a task. 

For example, the `build.js` task could have a `build.json` file with the following structure:

<code-listing heading="Task metadata">
  <source-code lang="JavaScript">
	{
	  "name": "build",
	  "description": "Builds and processes all application assets.",
	  "flags": [
	    {
	      "name": "env",
	      "description": "Sets the build environment.",
	      "type": "string"
	    },
	    {
	      "name": "watch",
	      "description": "Watches source files for changes and refreshes the bundles automatically.",
	      "type": "boolean"
	    }
	  ],
	  "parameters": [
	    {
	      "name": "some-parameter",
	      "description": "a description of this parameter"
	    }
	  ]
	}
  </source-code>
</code-listing>

Any task that has such json file, will show up in `au help`. It would display the description, any flag that is supported by the task and any parameters.

If the `type` of a flag is not set to `"boolean"` then `au help` will display that the flag supports a value.