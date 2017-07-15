'use strict';

module.exports = class {
  execute(context) {
    let switchVariable = context.state[this.stateProperty];
    let found;

    // property on the state is an array
    if (switchVariable instanceof Array) {
      for (let i = 0; i < switchVariable.length; i++) {
        let match = this.findMatch(switchVariable[i]);
        if (match) {
          found = match;
          break;
        }
      }
    } else {
      found = this.findMatch(switchVariable);
    }

    if (!found) {
      found = this.branches.find(x => x.case === 'default');
    }

    context.next(found.nextActivity);
  }

  findMatch(value) {
    if (value.id) {
      value = value.id;
    }

    return this.branches.find(x => x.case === value);
  }
};
