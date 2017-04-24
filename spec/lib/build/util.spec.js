'use strict';

const Utils = require('../../../lib/build/utils');

describe('the Utils.runSequentially function', () => {
  it('calls the callback function for all items', (d) => {
    let items = [{ name: 'first' }, { name: 'second' }];
    let cb = jasmine.createSpy('cb').and.returnValue(Promise.resolve());
    Utils.runSequentially(items, cb)
    .then(() => {
      expect(cb.calls.count()).toBe(2);
      expect(cb.calls.argsFor(0)[0].name).toBe('first');
      expect(cb.calls.argsFor(1)[0].name).toBe('second');
      d();
    });
  });

  it('runs in sequence', (d) => {
    let items = [{ name: 'first' }, { name: 'second' }, { name: 'third' }];
    let cb = jasmine.createSpy('cb').and.callFake((item) => {
      return new Promise(resolve => {
        if (item.name === 'first' || item.name === 'second') {
          setTimeout(() => resolve(), 200);
        } else {
          resolve();
        }
      });
    });
    Utils.runSequentially(items, cb)
    .then(() => {
      expect(cb.calls.argsFor(0)[0].name).toBe('first');
      expect(cb.calls.argsFor(1)[0].name).toBe('second');
      expect(cb.calls.argsFor(2)[0].name).toBe('third');
      d();
    });
  });

  it('handles empty items array', (done) => {
    let items = [];
    Utils.runSequentially(items, () => {})
    .catch(e => {
      done.fail(e, '', 'expected no error');
      throw e;
    })
    .then(() => {
      done();
    });
  });
});
