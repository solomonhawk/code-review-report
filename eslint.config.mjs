// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.FlatConfig} */
const config = {
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  config,
);
