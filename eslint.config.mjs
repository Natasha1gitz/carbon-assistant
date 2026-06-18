import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "commitlint.config.mjs",
    ],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/strict",
    "plugin:security/recommended-legacy",
    "plugin:sonarjs/recommended-legacy",
    "plugin:jsdoc/recommended-typescript-error"
  ),
  {
    rules: {
      "security/detect-object-injection": "off",
      "sonarjs/no-nested-conditional": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns": "off",
    },
  },
  {
    files: [
      "src/components/**/*.tsx",
      "src/app/**/*.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "src/hooks/**/*.ts",
    ],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
    },
  },
];

export default eslintConfig;
