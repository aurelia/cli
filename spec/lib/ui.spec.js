const {ConsoleUI} = require('../../lib/ui');

describe('The UI module', () => {
  let flags = [];
  let cliOptionsMock = {
    hasFlag(flag) {
      return flags.indexOf(flag) !== -1;
    }
  };
  let ui;

  beforeEach(() => {
    flags = [];
    ui = new ConsoleUI(cliOptionsMock);
  });

  describe('ensureAnswer', () => {
    it('returns provided answer', async() => {
      const answer = await ui._ensureAnswer('foo', 'question');
      expect(answer).toBe('foo');
    });

    it('returns suggested answer if user hits return', async() => {
      const answer = await ui._ensureAnswer('', 'question', 'suggested', ['']);
      expect(answer).toBe('suggested');
    });

    it('enforce non-empty answer if there is no suggested answer', async() => {
      const answer = await ui._ensureAnswer('', 'question', undefined, ['', '  ', ' some thing  ']);
      expect(answer).toBe('some thing');
    });
  });

  describe('question', () => {
    it('returns first choice if there is only one choice', async() => {
      const answer = await ui._question('question', [{value: 'foo', displayName: 'Foo', description: 'lorem'}]);
      expect(answer).toBe('foo');
    });

    it('returns first choice if there is no default value', async() => {
      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem'},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], undefined, ['']);
      expect(answer).toBe('foo');
    });

    it('returns default choice if user hits return', async() => {
      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem'},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], 'bar', ['']);
      expect(answer).toBe('bar');
    });

    it('user can select a choice', async() => {
      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem'},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('bar');
    });

    it('supports disabled option', async() => {
      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem'},
        {value: 'dis', displayName: 'Disabled', description: 'lorem3', disabled: true},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('bar');
    });

    it('supports cli flag', async() => {
      flags.push('hello');

      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem', flag: 'dis'},
        {value: 'dis', displayName: 'Disabled', description: 'lorem3', flag: 'hello'},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], undefined, [1]);
      expect(answer).toBe('dis');
    });

    it('supports cli flag, case2', async() => {
      flags.push('hello');

      const answer = await ui._question('question', [
        {value: 'foo', displayName: 'Foo', description: 'lorem', flag: 'dis'},
        {value: 'dis', displayName: 'Disabled', description: 'lorem3', flag: 'hello'},
        {value: 'bar', displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('bar');
    });
  });

  describe('question (with options have no value)', () => {
    it('returns first choice if there is only one choice', async() => {
      const answer = await ui._question('question', [{displayName: 'Foo', description: 'lorem'}]);
      expect(answer).toBe('Foo');
    });

    it('returns first choice if there is no default value', async() => {
      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem'},
        {displayName: 'Bar', description: 'lorem2'}
      ], undefined, ['']);
      expect(answer).toBe('Foo');
    });

    it('returns default choice if user hits return', async() => {
      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem'},
        {displayName: 'Bar', description: 'lorem2'}
      ], 'Bar', ['']);
      expect(answer).toBe('Bar');
    });

    it('user can select a choice', async() => {
      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem'},
        {displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('Bar');
    });

    it('supports disabled option', async() => {
      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem'},
        {displayName: 'Disabled', description: 'lorem3', disabled: true},
        {displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('Bar');
    });

    it('supports cli flag', async() => {
      flags.push('hello');

      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem', flag: 'dis'},
        {displayName: 'Disabled', description: 'lorem3', flag: 'hello'},
        {displayName: 'Bar', description: 'lorem2'}
      ], undefined, [1]);
      expect(answer).toBe('Disabled');
    });

    it('supports cli flag, case2', async() => {
      flags.push('hello');

      const answer = await ui._question('question', [
        {displayName: 'Foo', description: 'lorem', flag: 'dis'},
        {displayName: 'Disabled', description: 'lorem3', flag: 'hello'},
        {displayName: 'Bar', description: 'lorem2'}
      ], undefined, [2]);
      expect(answer).toBe('Bar');
    });
  });

  describe('multiselect', () => {
    it('ensures at least one selected', async() => {
      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'bar', displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.submit();
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['foo']);
    });

    it('ensures at least one selected, case2', async() => {
      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'bar', displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.submit();
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['dis']);
    });

    it('selects multi values', async() => {
      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'bar', displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['foo', 'bar']);
    });

    it('supports disabled option', async() => {
      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'dis2', displayName: 'Disabled', disabled: true},
        {value: 'bar', displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['foo', 'bar']);
    });

    it('supports cli flag', async() => {
      flags.push('hello');

      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'dis2', displayName: 'Disabled', flag: 'disabled'},
        {value: 'bar', displayName: 'Bar', flag: 'hello'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['foo', 'bar']);
    });

    it('supports cli flag, case2', async() => {
      flags.push('hello');

      const answer = await ui._multiselect('question', [
        {value: 'foo', displayName: 'Foo', flag: 'disabled'},
        {value: 'dis', displayName: 'Disabled'},
        {value: 'dis2', displayName: 'Disabled'},
        {value: 'bar', displayName: 'Bar', flag: 'hello'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['dis', 'bar']);
    });
  });

  describe('multiselect (with options have no value)', () => {
    it('ensures at least one selected', async() => {
      const answer = await ui._multiselect('question', [
        {displayName: 'Foo'},
        {displayName: 'Disabled'},
        {displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.submit();
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Foo']);
    });

    it('ensures at least one selected, case2', async() => {
      const answer = await ui._multiselect('question', [
        {displayName: 'Foo'},
        {displayName: 'Disabled'},
        {displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.submit();
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Disabled']);
    });

    it('selects multi values', async() => {
      const answer = await ui._multiselect('question', [
        {displayName: 'Foo'},
        {displayName: 'Disabled'},
        {displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Foo', 'Bar']);
    });

    it('supports disabled option', async() => {
      const answer = await ui._multiselect('question', [
        {displayName: 'Foo'},
        {displayName: 'Disabled'},
        {displayName: 'Disabled', disabled: true},
        {displayName: 'Bar'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Foo', 'Bar']);
    });

    it('supports cli flag', async() => {
      flags.push('hello');

      const answer = await ui._multiselect('question', [
        {displayName: 'Foo'},
        {displayName: 'Disabled'},
        {displayName: 'Disabled', flag: 'disabled'},
        {displayName: 'Bar', flag: 'hello'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Foo', 'Bar']);
    });

    it('supports cli flag, case2', async() => {
      flags.push('hello');

      const answer = await ui._multiselect('question', [
        {displayName: 'Foo', flag: 'disabled'},
        {displayName: 'Disabled'},
        {displayName: 'Disabled2'},
        {displayName: 'Bar', flag: 'hello'}
      ], [async(prompt) => {
        await prompt.keypress(' ');
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(null, {name: 'down'});
        await prompt.keypress(' ');
        await prompt.submit();
      }]);

      expect(answer).toEqual(['Disabled', 'Bar']);
    });
  });
});
