import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

// Minimal flat ESLint config for Vite + React (TypeScript)
// Replaced Next.js-specific config which required eslint-config-next (not installed)
const eslintConfig = defineConfig([
  js.configs.recommended,
  // Ignore build output and generated files
  globalIgnores([
    "dist/**",
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.d.ts",
  ]),
  {
    // Declare browser + ES2021 globals (fetch, window, document, setTimeout, etc.)
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Allow unused vars prefixed with _ (common TypeScript convention)
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow console in dev context
      "no-console": "warn",
    },
  },
]);

export default eslintConfig;
