describe('The new command', () => {
  const Command = require('../../../../lib/commands/new/command');

  const specs = [
    {
      input: ['foo', 'bar'],
      isValid: false
    },
    {
      input: ['foo'],
      isValid: true
    },
    {
      input: ['foo-bar'],
      isValid: true
    },
    {
      input: ['foo', 'foo-bar'],
      isValid: false
    },
    {
      input: ['foo', '-foo-bar'],
      isValid: false
    }
  ];

  for (const spec of specs) {
    it(`validates ${spec.input.join(' ')} as isValid=${spec.isValid}`, () => {
      const stubUI = {
        displayLogo() { }
      };
      const stubOptions = {
        hasFlag() { return false; },
        getFlagValue() { return ''; }
      };

      let message;
      const originalLog = console.log;
      const logSpy = (msg) => {
        message = msg;
        console.log(msg);
      };
      console.log = logSpy;

      const sut = new Command(stubUI, stubOptions);

      sut.execute(['foo', 'bar']);

      console.log = originalLog;

      if (spec.isValid) {
        expect(message).toBe('...');
      } else {
        expect(message).toBe(' Kindly provide only one argument as the <project-name>');
      }
    });
  }
});
