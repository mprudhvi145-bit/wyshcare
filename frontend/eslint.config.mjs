/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/eslint.config.mjs
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * eslint.config — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/eslint.config.mjs
 - shared/eslint.config.mjs
 *
 * Calls:
 - eslint-plugin-next
 - eslint-plugin-react
 - js
 - typescript-eslint
 - eslint-plugin-react-hooks
 *
 * Dependencies:
 - eslint-plugin-next
 - eslint-plugin-react
 - js
 - typescript-eslint
 - eslint-plugin-react-hooks
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

/**
 * ==================================================
 * WYSHCARE — FRONTEND ESLINT CONFIG (ESLINT v9)
 * --------------------------------------------------
 * Next.js App Router (app/)
 * TypeScript + TSX
 * React + Hooks
 * Parsing-safe
 * Minimal noise
 * ==================================================
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";

export default [
  /* -----------------------------
     Base JS
  ------------------------------ */
  js.configs.recommended,

  /* -----------------------------
     TypeScript (parser included)
  ------------------------------ */
  ...tseslint.configs.recommended,

  /* -----------------------------
     Frontend rules
  ------------------------------ */
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": next,
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      /* Next.js */
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",

      /* React */
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      /* Hooks */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* TypeScript */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",

      /* JS */
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "prefer-const": "warn",

      /* Logging */
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  /* -----------------------------
     Ignore generated files
  ------------------------------ */
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "coverage/",
      "prisma/",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];