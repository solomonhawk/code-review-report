import { config } from "@epic-web/config/prettier";

/** @type {import("prettier").Options} */
export default {
  ...config,
  semi: true,
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  arrowParens: "always",
  trailingComma: "all",
};
