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
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**", "commitlint.config.mjs"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended-legacy",
    "plugin:sonarjs/recommended-legacy"
  ),
  {
    rules: {
      "security/detect-object-injection": "off",
      "sonarjs/no-nested-conditional": "off"
    }
  },
];

export default eslintConfig;
