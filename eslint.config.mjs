import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  // Global ignores (must be a standalone object).
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "public/**",
      "next-env.d.ts",
      // Non-app artefacts checked into the repo
      "design_page/**",
      "promotion/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Ratchet, don't block: the pre-existing `any` casts are tracked by
      // IMPROVEMENT_PLAN.md Phase 1.1/4.x and shrink as generated DB types
      // propagate. New code should not add more (warnings stay visible).
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
