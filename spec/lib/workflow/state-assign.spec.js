'use strict';

describe('The StateAssign module', () => {
  let sut;

  beforeEach(() => {
    sut = new (require('../../../lib/workflow/activities/state-assign'));
  });

  it('applies state', () => {
    let stateassign = Object.assign(sut, {
      nextActivity: 15,
      state: {
        name: 'my-app',
        unitTestRunners: ['karma', 'jest']
      }
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };

    sut.execute.call(stateassign, context);

    expect(context.state.name).toBe('my-app');
    expect(context.state.unitTestRunners).toEqual(['karma', 'jest']);
    expect(next).toHaveBeenCalledWith(15);
  });
});
