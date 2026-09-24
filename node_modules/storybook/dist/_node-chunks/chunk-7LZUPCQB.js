import CJS_COMPAT_NODE_URL_qjinduibsyq from 'node:url';
import CJS_COMPAT_NODE_PATH_qjinduibsyq from 'node:path';
import CJS_COMPAT_NODE_MODULE_qjinduibsyq from "node:module";

var __filename = CJS_COMPAT_NODE_URL_qjinduibsyq.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_qjinduibsyq.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_qjinduibsyq.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------

// src/shared/constants/extensions.ts
var jsModuleExtensions = [".mjs", ".js", ".cjs"], jsTsSourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"], storybookConfigExtensions = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".mjs",
  ".mts",
  ".mtsx",
  ".cjs",
  ".cts",
  ".ctsx"
], userModuleExtensions = [
  ".astro",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".vue",
  ".svelte"
];

export {
  jsModuleExtensions,
  jsTsSourceExtensions,
  storybookConfigExtensions,
  userModuleExtensions
};
