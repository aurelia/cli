"use strict";

module.exports = class {
  execute(context) {
    Object.assign(context.state, this.state);
    context.next(this.nextActivity);
  }
}
