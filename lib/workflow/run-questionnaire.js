const _ = require('lodash');
const {Select} = require('enquirer');
const applicable = require('./applicable');
const prettyChoices = require('./pretty-choices');
const {Writable} = require('stream');

// Get user provided preselectedFeatures, go through all the questions,
// Output a cleaned up features.
//
// _debug is used to pass in answers for prompts.
module.exports = async function(preselectedFeatures = [], questions, unattended, _debug = []) {
  preselectedFeatures = _.map(preselectedFeatures, _.toLower);
  const pickedFeatures = [];

  async function ask(question) {
    let choices = prettyChoices(question.choices);

    choices.forEach(c => {
      if (c.value !== 'string' && !c.value.match(/^([a-zA-Z1-9\-])*$/)) {
        throw new Error(`Value "${c.value}" is invalid. Only accept letters, numbers, and dash(-).`);
      }
    });

    // Conditional choices
    // {value: 'foo', message: 'Foo', hint: 'lorem', if: 'webpack && typescript'}
    choices = choices.filter(c => !c.if || applicable(pickedFeatures, c.if));
    if (choices.length === 0) return;
    if (choices.length === 1) {
      pickedFeatures.push(choices[0].value);
      return;
    }

    // Run existing logic to skip question.
    // check ./applicable.js for acceptable expression
    if (question.if && !applicable(pickedFeatures, question.if)) {
      return;
    }

    // find the last match, in order to allow user to overwrite
    let selected;
    let matchingIndex;
    _.each(choices, c => {
      // skip empty value
      if (c.value === 'none') return;
      const idx = preselectedFeatures.indexOf(c.value);
      if (idx === -1) return;
      if (matchingIndex === undefined || matchingIndex < idx) {
        matchingIndex = idx;
        selected = c.value;
      }
    });

    // Inject user selected answer into inquirer answers,
    // then skip the question
    if (selected) {
      pickedFeatures.push(selected);
      return;
    }

    // Pick default answer in unattended mode
    if (unattended) {
      const first = _.trim(choices[0].value);
      if (first !== 'none') pickedFeatures.push(first);
      return true;
    }

    // choice index is 1-based.
    let debugChoiceIdx = _debug.shift();

    // All questions are select.
    const opts = {
      ...question,
      choices,
      // Default to first choice.
      initial: 0,
      // https://github.com/enquirer/enquirer/issues/121#issuecomment-468413408
      result(name) {
        return this.map(name)[name];
      }
    };

    if (debugChoiceIdx) {
      // Silent output in debug mode
      opts.stdout = new Writable({write(c, e, cb) {cb();}});
    }

    const prompt = new Select(opts);

    if (debugChoiceIdx) {
      prompt.once('run', async() => {
        while (debugChoiceIdx-- > 0) {
          if (debugChoiceIdx) {
            await prompt.keypress(null, { name: 'down' });
          } else {
            await prompt.submit();
          }
        }
      });
    }

    const picked = await prompt.run();
    if (picked !== 'none') pickedFeatures.push(picked);
  }

  for (let i = 0, ii = questions.length; i < ii; i++) {
    await ask(questions[i]);
  }

  return pickedFeatures;
};
