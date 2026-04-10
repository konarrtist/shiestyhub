/** @type {import("eslint").Linter.FlatConfig[]} */
const next = require("eslint-config-next")

module.exports = [
  {
    ignores: ["**/.next/**", "**/node_modules/**", "pnpm-lock.yaml"],
  },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
]
