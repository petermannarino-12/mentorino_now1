import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  process: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  fetch: "readonly",
  sessionStorage: "readonly",
  HTMLDivElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLButtonElement: "readonly",
  HTMLVideoElement: "readonly",
  MouseEvent: "readonly",
  Node: "readonly",
  MutationObserver: "readonly",
  URLSearchParams: "readonly",
  crypto: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...typescriptEslintPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
      "jsx-a11y/no-autofocus": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...browserGlobals,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
];
