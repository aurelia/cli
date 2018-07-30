'use strict';

describe('The InputText module', () => {
  let sut;
  let ui;

  beforeEach(() => {
    let Container = require('aurelia-dependency-injection').Container;
    let UI = require('../../../lib/ui').UI;
    let FakeUI = require('../../mocks/ui');
    let InputText = require('../../../lib/workflow/activities/input-text');
    let container = new Container();
    container.registerAlias(FakeUI, UI);
    ui = container.get(UI);
    sut = container.get(InputText);
  });

  it('stores answer on the state', done => {
    let definition = Object.assign(sut, {
      id: 1160,
      type: 'input-text',
      stateProperty: 'name',
      nextActivity: 1170,
      question: 'What would you like to call the app?'
    });
    let next = jasmine.createSpy('next');
    let context = {
      state: {},
      next: next
    };
    // user selected karma
    ui.ensureAnswer.and.returnValue(Promise.resolve('my-app'));

    sut.execute.call(definition, context).then(() => {
      expect(context.state.name).toBe('my-app');
      expect(next).toHaveBeenCalledWith(1170);

      done();
    }).catch(e => done.fail(e));
  });
});
