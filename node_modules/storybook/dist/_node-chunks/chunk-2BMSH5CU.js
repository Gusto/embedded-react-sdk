import CJS_COMPAT_NODE_URL_qjinduibsyq from 'node:url';
import CJS_COMPAT_NODE_PATH_qjinduibsyq from 'node:path';
import CJS_COMPAT_NODE_MODULE_qjinduibsyq from "node:module";

var __filename = CJS_COMPAT_NODE_URL_qjinduibsyq.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_qjinduibsyq.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_qjinduibsyq.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------
import {
  nanoid
} from "./chunk-2J2NU66Q.js";

// src/telemetry/session-id.ts
import { cache } from "storybook/internal/common";
var SESSION_TIMEOUT = 1e3 * 60 * 60 * 2, sessionId, resetSessionIdForTest = (val = void 0) => {
  sessionId = val;
}, getSessionId = async () => {
  let now = Date.now();
  if (!sessionId) {
    let session = await cache.get("session");
    session && session.lastUsed >= now - SESSION_TIMEOUT ? sessionId = session.id : sessionId = nanoid();
  }
  return await cache.set("session", { id: sessionId, lastUsed: now }), sessionId;
};

export {
  SESSION_TIMEOUT,
  resetSessionIdForTest,
  getSessionId
};
