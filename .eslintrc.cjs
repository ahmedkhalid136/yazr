module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  ignorePatterns: ["dist/**/*"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
};
