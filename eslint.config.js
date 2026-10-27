import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".wrangler/**",
      ".tanstack/**",
      ".output",
      ".vinxi",
      "backend/archive/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "**/*.tsbuildinfo",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["frontend/app/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["backend/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/*", "@admin/**", "**/frontend/**", "**/admin/**"],
              message:
                "Backend must not depend on frontend or admin. Use backend/contracts for shared types and validation.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "admin/**/*.{ts,tsx}",
      "frontend/components/**/*.{ts,tsx}",
      "frontend/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@backend/api/**",
                "@backend/database/**",
                "@backend/lib/**",
                "@backend/server",
                "**/backend/api/**",
                "**/backend/database/**",
                "**/backend/lib/**",
              ],
              message:
                "UI components must use API functions or backend/contracts, never server implementation modules.",
            },
          ],
        },
      ],
    },
  },
  eslintPluginPrettier,
);
