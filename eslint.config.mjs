// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["src/build/amodro-trace", "**/dist", "**/lib", "./spec"]
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jasmine
      },

      ecmaVersion: 2023,
      sourceType: "module"
    },

    rules: {
      "no-prototype-builtins": 0,
      "no-console": 0,
      "getter-return": 0,
      "no-inner-declarations": 0,

      "comma-dangle": ["error", {
        arrays: "never",
        objects: "never",
        imports: "never",
        exports: "never",
        functions: "never"
      }],
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
);
