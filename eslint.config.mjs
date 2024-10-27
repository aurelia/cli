import globals from "globals";
import eslint from "@eslint/js";

export default [
  {
    ignores: ["lib/build/amodro-trace", "**/dist"],
  },
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jasmine,
      },

      ecmaVersion: 2019,
      sourceType: "commonjs",
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
        functions: "never",
      }],
    },
  }
];
