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
  oxcParse
} from "../_node-chunks/chunk-IMMVTA66.js";
import "../_node-chunks/chunk-DW727PJG.js";
import "../_node-chunks/chunk-FE5AV6EP.js";
import "../_node-chunks/chunk-VGN5LGMI.js";
import "../_node-chunks/chunk-4US4PNS3.js";

// src/oxc-parser/worker.ts
import { parentPort } from "node:worker_threads";
if (!parentPort)
  throw new Error("oxc-parser worker must be run as a worker thread");
var port = parentPort;
port.on("message", async (msg) => {
  try {
    let edges = await oxcParse(msg.filePath, msg.source), response = { id: msg.id, ok: !0, edges };
    port.postMessage(response);
  } catch (error) {
    let err = error, response = {
      id: msg.id,
      ok: !1,
      message: err?.message ?? String(error),
      name: err?.name ?? "Error"
    };
    port.postMessage(response);
  }
});
