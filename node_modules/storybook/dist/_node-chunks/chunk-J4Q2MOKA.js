import CJS_COMPAT_NODE_URL_qjinduibsyq from 'node:url';
import CJS_COMPAT_NODE_PATH_qjinduibsyq from 'node:path';
import CJS_COMPAT_NODE_MODULE_qjinduibsyq from "node:module";

var __filename = CJS_COMPAT_NODE_URL_qjinduibsyq.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_qjinduibsyq.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_qjinduibsyq.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------

// src/shared/utils/paths.ts
var NODE_MODULES_SEGMENT = /(?:^|[/\\])node_modules(?:[/\\]|$)/;
function slash(path) {
  return path.replace(/\\/g, "/");
}
function isInNodeModules(path) {
  return NODE_MODULES_SEGMENT.test(path);
}

export {
  slash,
  isInNodeModules
};
