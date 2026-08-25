import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // screenshot-to-code is a read-only reference repo (abi); not our code to lint.
  // dist/ and public/demos are build artifacts / hand-authored demo pages.
  { ignores: ["dist", "screenshot-to-code/**", "public/demos/**"] },
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
      // Project is not in strict mode (tsconfig.app.json strict:false); `any` is
      // intentional in several places. Warn rather than fail so CI stays green.
      "@typescript-eslint/no-explicit-any": "warn",
      // tailwind.config.ts legitimately uses CommonJS require().
      "@typescript-eslint/no-require-imports": "off",
      // shadcn/ui scaffold emits empty interface extensions (e.g. BadgeProps).
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
);
