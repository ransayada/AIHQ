import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";

// @eslint/eslintrc is CJS-only; use createRequire for ESM interop
const require = createRequire(import.meta.url);
const { FlatCompat } = require("@eslint/eslintrc");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals"),
];
