import CJS_COMPAT_NODE_URL_qjinduibsyq from 'node:url';
import CJS_COMPAT_NODE_PATH_qjinduibsyq from 'node:path';
import CJS_COMPAT_NODE_MODULE_qjinduibsyq from "node:module";

var __filename = CJS_COMPAT_NODE_URL_qjinduibsyq.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_qjinduibsyq.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_qjinduibsyq.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------

// src/shared/open-service/toolset-definition.ts
function resolveToolsetDescription(description, context) {
  return typeof description == "function" ? description(context) : description;
}
async function reportToolsetTelemetry(context, event, payload) {
  try {
    await context.telemetry?.(event, payload);
  } catch {
  }
}

export {
  resolveToolsetDescription,
  reportToolsetTelemetry
};
