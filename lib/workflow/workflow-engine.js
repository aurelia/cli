"use strict";
const Container = require('aurelia-dependency-injection').Container;

exports.WorkflowEngine = class {
  constructor(definition, container) {
    this.definition = definition;
    this.container = container || new Container();

    this.configureContainer(this.container);
  }

  start(state) {
    return new Promise((resolve, reject) => {
      let context = new exports.WorkflowContext(this, state, resolve, reject);
      let activity = this.createActivity(this.definition.activities[0]);
      activity.execute(context);
    });
  }

  getActivityById(id) {
    return this.definition.activities.find(x => x.id === id);
  }

  createActivity(definition) {
    let activity = this.container.get(definition.type);
    Object.assign(activity, definition);
    return activity;
  }

  configureContainer(container) {
    [
      'state-assign',
      'input-text',
      'input-select',
      'branch-switch',
      'project-create',
      'project-install'
    ].forEach(type => {
      container.registerTransient(type, require(`./activities/${type}`));
    });
  }
}

exports.WorkflowContext = class {
  constructor(workflow, state, resolve, reject) {
    this.workflow = workflow;
    this.state = state || {};
    this._resolve = resolve;
    this._reject = reject;
  }

  next(activityId) {
    if (activityId === null || activityId === undefined) {
      return this._resolve(this.state);
    }

    let next = this.workflow.getActivityById(activityId);

    if (!next) {
      return this._resolve(this.state);
    }

    let activity = this.workflow.createActivity(next);
    activity.execute(this);
  }

  cancel() {
    this._reject(this.state);
  }
}
