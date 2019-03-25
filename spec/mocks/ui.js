module.exports = class UI {
  constructor() {
    this.multiselect = jasmine.createSpy('multiselect').and.returnValue(Promise.resolve());
    this.question = jasmine.createSpy('question').and.returnValue(Promise.resolve());
    this.ensureAnswer = jasmine.createSpy('ensureAnswer').and.returnValue(Promise.resolve());
    this.log = jasmine.createSpy('log');
  }
};
