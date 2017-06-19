'use strict';

describe('The BranchSwitch module', () => {
  let sut;

  beforeEach(() => {
    sut = new (require('../../../lib/workflow/activities/branch-switch'));
  });

  it('finds the correct branch (as array)', () => {
    let branchswitch = Object.assign(sut, {
      stateProperty: 'unitTestRunner',
      branches: [{
        case: 'jest',
        nextActivity: 30
      }, {
        case: 'karma',
        nextActivity: 15
      }]
    });
    let next = jasmine.createSpy('next');

    sut.execute.call(branchswitch, {
      state: {
        unitTestRunner: ['something', 'else', 'karma']
      },
      next: next
    });

    expect(next).toHaveBeenCalledWith(15);
  });

  it('finds the correct branch (as string)', () => {
    let branchswitch = Object.assign(sut, {
      stateProperty: 'unitTestRunner',
      branches: [{
        case: 'jest',
        nextActivity: 30
      }, {
        case: 'karma',
        nextActivity: 15
      }]
    });
    let next = jasmine.createSpy('next');

    sut.execute.call(branchswitch, {
      state: {
        unitTestRunner: 'karma'
      },
      next: next
    });

    expect(next).toHaveBeenCalledWith(15);
  });

  it('finds the correct branch (as object)', () => {
    let branchswitch = Object.assign(sut, {
      stateProperty: 'unitTestRunner',
      branches: [{
        case: 'jest',
        nextActivity: 30
      }, {
        case: 'karma',
        nextActivity: 15
      }]
    });
    let next = jasmine.createSpy('next');

    sut.execute.call(branchswitch, {
      state: {
        unitTestRunner: {
          id: 'karma'
        }
      },
      next: next
    });

    expect(next).toHaveBeenCalledWith(15);
  });

  it('uses default branch if there is no matching branch', () => {
    let branchswitch = Object.assign(sut, {
      stateProperty: 'unitTestRunner',
      branches: [{
        case: 'jest',
        nextActivity: 30
      }, {
        case: 'default',
        nextActivity: 15
      }]
    });
    let next = jasmine.createSpy('next');

    sut.execute.call(branchswitch, {
      state: {
        unitTestRunner: {
          id: 'karma'
        }
      },
      next: next
    });

    expect(next).toHaveBeenCalledWith(15);
  });
});
