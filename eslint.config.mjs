// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import stylisticJS from '@stylistic/eslint-plugin-js';

export default tseslint.config(
  {
    ignores: ['src/build/amodro-trace', '**/dist', '**/lib', './spec', './build', './bin']
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/js': stylisticJS
    }
  },
  {
    rules: {
      'no-prototype-builtins': 0,
      'no-console': 0,
      'getter-return': 0,
      'no-inner-declarations': 0,
      'comma-dangle': ['error', {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }],
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
      '@stylistic/js/quotes': ['warn', 'single'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  }
);
