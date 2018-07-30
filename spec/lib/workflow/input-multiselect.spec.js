'use strict';

describe('The InputMultiselect module', () => {
  let sut;
  let ui;

  beforeEach(() => {
    let Container = require('aurelia-dependency-injection').Container;
    let UI = require('../../../lib/ui').UI;
    let FakeUI = require('../../mocks/ui');
    let InputMultiselect = require('../../../lib/workflow/activities/input-multiselect');
    let container = new Container();
    container.registerAlias(FakeUI, UI);
    ui = container.get(UI);
    sut = container.get(InputMultiselect);
  });

  it('stores selected answers on the state', done => {
    let options = [{
      displayName: 'Jest',
      description: 'Configure your app with Jasmine and Karma.',
      value: 'jest'
    },
    {
      displayName: 'Karma',
      description: 'Configure the app with Karma and Jasmine',
      value: 'karma'
    }];
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-multiselect',
      nextActivity: 1170,
      stateProperty: 'unitTestRunner',
      question: 'Which test runners would you like to use?',
      options: options
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };
    // user selected all opptions
    ui.multiselect.and.returnValue(Promise.resolve(options));

    sut.execute.call(definition, context).then(() => {
      expect(context.state.unitTestRunner).toEqual(['jest', 'karma']);

      done();
    }).catch(e => done.fail(e));
  });

  it('goes to the nextActivity', done => {
    let options = [{
      displayName: 'Protractor',
      description: 'Configure your app with Jasmine and Karma.',
      stateProperty: 'integrationTestRunner',
      value: 'protractor'
    }];
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-multiselect',
      nextActivity: 1170,
      question: 'Which test runners would you like to use?',
      options: options
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };
    // user selected all opptions
    ui.multiselect.and.returnValue(Promise.resolve(options));

    sut.execute.call(definition, context).then(() => {
      expect(next).toHaveBeenCalledWith(1170);

      done();
    }).catch(e => done.fail(e));
  });

  it('stores the value as an array if type of answer is array', done => {
    let options = [{
      displayName: 'Protractor',
      description: 'Configure your app with Protractor',
      type: 'array',
      value: 'protractor'
    }, {
      displayName: 'Karma',
      description: 'Configure your app with Jasmine and Karma.',
      type: 'array',
      value: 'karma'
    }];
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-multiselect',
      nextActivity: 1170,
      stateProperty: 'integrationTestRunner',
      question: 'Which test runners would you like to use?',
      options: options
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };
    // user selected all opptions
    ui.multiselect.and.returnValue(Promise.resolve(options));

    sut.execute.call(definition, context).then(() => {
      expect(context.state.integrationTestRunner).toEqual(['protractor', 'karma']);

      done();
    }).catch(e => done.fail(e));
  });
});
