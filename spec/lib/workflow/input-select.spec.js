'use strict';

describe('The InputSelect module', () => {
  let sut;
  let ui;

  beforeEach(() => {
    let Container = require('aurelia-dependency-injection').Container;
    let UI = require('../../../lib/ui').UI;
    let FakeUI = require('../../mocks/ui');
    let InputSelect = require('../../../lib/workflow/activities/input-select');
    let container = new Container();
    container.registerAlias(FakeUI, UI);
    ui = container.get(UI);
    sut = container.get(InputSelect);
  });

  it('stores selected answer on the state', done => {
    let options = [{
      displayName: 'Protractor',
      description: 'Configure your app with Jasmine and Karma.',
      value: 'protractor'
    },
    {
      displayName: 'Karma',
      description: 'Configure the app with Karma and Jasmine',
      value: 'karma'
    }];
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-select',
      stateProperty: 'unitTestRunner',
      nextActivity: 1170,
      question: 'Which test runner would you like to use?',
      options: options
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };
    // user selected karma
    ui.question.and.returnValue(Promise.resolve(options[1]));

    sut.execute.call(definition, context).then(() => {
      expect(context.state.unitTestRunner).toBe('karma');
      expect(next).toHaveBeenCalledWith(1170);

      done();
    }).catch(e => done.fail(e));
  });

  it('uses override property is it is on the state', () => {
    let options = [{
      displayName: 'Protractor',
      description: 'Configure your app with Jasmine and Karma.',
      value: 'protractor'
    },
    {
      displayName: 'Karma',
      description: 'Configure the app with Karma and Jasmine',
      value: 'karma'
    }];
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-select',
      stateProperty: 'unitTestRunner',
      nextActivity: 1170,
      question: 'Which test runner would you like to use?',
      options: options
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {
        unitTestRunnerOverride: 'protractor'
      },
      next: next
    };

    sut.execute.call(definition, context);
    expect(context.state.unitTestRunner).toBe('protractor');
    expect(next).toHaveBeenCalledWith(1170);
  });
});
