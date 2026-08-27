import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["docs", "packages/core/dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022 },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // ADR-0002: core is the audit surface for the health logic — no
    // runtime dependencies, no I/O. A bare import is the first step
    // away from that, and it is much easier to refuse here than to
    // argue back out of later.
    files: ["packages/core/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^[^.]",
              message:
                "packages/core has no runtime dependencies and no I/O (ADR-0002). Relative imports only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    // The React rules apply to the mobile app only. apps/web is frozen
    // until the information site replaces it (ADR-0001) -- no new React
    // is written there, and rewriting its effects would be work on code
    // that is going away.
    files: ["apps/mobile/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
);
