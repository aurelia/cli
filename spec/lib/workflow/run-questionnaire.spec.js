const run = require('../../../lib/workflow/run-questionnaire');

describe('The run-questionaire module', () => {
  describe('in unattended mode', () => {
    it('returns first choice by default', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], true);
      expect(result).toEqual(['webpack', 'web']);
    });

    it('returns first choice by default, ignore none', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'none', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], true);
      expect(result).toEqual(['webpack']);
    });

    it('returns preselected choice, case1', async() => {
      const result = await run(['cli-bundler'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], true);
      expect(result).toEqual(['cli-bundler', 'web']);
    });

    it('returns preselected choice, case2', async() => {
      const result = await run(['dotnet-core'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], true);
      expect(result).toEqual(['webpack', 'dotnet-core']);
    });

    it('returns preselected choice, but cleaned up', async() => {
      const result = await run(['webpack', 'cli-bundler', 'dotnet-core', 'web'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], true);
      expect(result).toEqual(['cli-bundler', 'web']);
    });

    it('supports condition', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ],
          if: 'webpack'
        }
      ], true);
      expect(result).toEqual(['webpack', 'web']);
    });

    it('supports condition, case2', async() => {
      const result = await run(['cli-bundler'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ],
          if: 'webpack'
        }
      ], true);
      expect(result).toEqual(['cli-bundler']);
    });

    it('supports choice condition', async() => {
      const result = await run(['cli-bundler', 'dotnet-core'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core', if: 'webpack'}
          ]
        }
      ], true);
      expect(result).toEqual(['cli-bundler', 'web']);
    });
  });

  describe('in interactive mode', () => {
    it('pick choices', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], false, [2, 1]);
      expect(result).toEqual(['cli-bundler', 'web']);
    });

    it('pick choices, case2', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], false, [1, 2]);
      expect(result).toEqual(['webpack', 'dotnet-core']);
    });

    it('pick choices, ignore none', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'none', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ]
        }
      ], false, [2, 1]);
      expect(result).toEqual(['cli-bundler']);
    });

    it('supports condition', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ],
          if: 'webpack'
        }
      ], false, [1, 2]);
      expect(result).toEqual(['webpack', 'dotnet-core']);
    });

    it('supports condition, case2', async() => {
      const result = await run(['cli-bundler'], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core'}
          ],
          if: 'webpack'
        }
      ], false, [2, 2]);
      expect(result).toEqual(['cli-bundler']);
    });

    it('supports choice condition, do not ask single choice question', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web'},
            {value: 'dotnet-core', message: '.NET Core', if: 'webpack'}
          ]
        }
      ], false, [2]);
      expect(result).toEqual(['cli-bundler', 'web']);
    });

    it('supports choice condition, do not ask zero choice question', async() => {
      const result = await run([], [
        {
          message: 'bundler',
          choices: [
            {value: 'webpack', message: 'Webpack'},
            {value: 'cli-bundler', message: 'CLI Bundler'}
          ]
        },
        {
          message: 'platform',
          choices: [
            {value: 'web', message: 'Web', if: 'webpack'},
            {value: 'dotnet-core', message: '.NET Core', if: 'webpack'}
          ]
        }
      ], false, [2]);
      expect(result).toEqual(['cli-bundler']);
    });
  });
});
