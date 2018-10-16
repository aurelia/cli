---
name: Updating
description: The process of updating the Aurelia CLI.
author: Jeroen Vinke (https://jeroenvinke.nl)
---

## Updating the Aurelia CLI

There are a few steps involved to update the Aurelia CLI to a newer version. In this chapter, these steps will be explained.

Good thing to know is that Aurelia CLI is actually installed twice, once globally and once locally. The globally installed Aurelia CLI (`npm install aurelia-cli -g`) can be found in your user profile and the local one lives inside the `node_modules` folder of your project. The global Aurelia CLI is used when you're not inside a project directory, for example when you create a new Aurelia CLI project using `au new`. Inside a project directory, however, the local version of Aurelia CLI is used. That allows you to use different versions of the Aurelia CLI per project.

Since the CLI is installed both globally and locally, you need to update both. First, run `npm install aurelia-cli@latest -g` to update the CLI globally, and run `npm install aurelia-cli@latest --save-dev` from the project directory to update the local Aurelia CLI.

We're continuously improving the project setup to make development better and easier. This sometimes involves updating Gulp tasks. So when you want to update an existing project, you'll want to update the Gulp tasks as well. The recommended way to do this is to update the CLI globally and create a new project using `au new`. Then you can copy over the tasks in the `aurelia_project/tasks` directory to your own project.

Always check out the release notes on the Aurelia blog as they may contain additional instructions for updating the CLI.
