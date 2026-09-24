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
  errorToErrorLike
} from "../../../../../_node-chunks/chunk-HVTJ6ETP.js";
import "../../../../../_node-chunks/chunk-PPVCVHOS.js";
import "../../../../../_node-chunks/chunk-J4Q2MOKA.js";
import "../../../../../_node-chunks/chunk-4US4PNS3.js";

// src/shared/open-service/services/docgen/worker/docgen-worker.ts
import { parentPort } from "node:worker_threads";
import { pathToFileURL } from "node:url";
import { logger } from "storybook/internal/node-logger";
if (!parentPort)
  throw new Error("docgen worker must be run as a worker thread");
var port = parentPort, seedProvider = async () => {
}, providerPromise;
async function composeProvider(descriptors) {
  let provider = seedProvider;
  for (let descriptor of descriptors) {
    let mod = await import(pathToFileURL(descriptor.moduleSpecifier).href);
    if (typeof mod.createDocgenProvider != "function")
      throw new Error(
        `docgen worker module "${descriptor.moduleSpecifier}" does not export createDocgenProvider`
      );
    provider = (await mod.createDocgenProvider(descriptor.options))(provider);
  }
  return provider;
}
async function handleInit({ descriptors, logLevel }) {
  try {
    logger.setLogLevel(logLevel), providerPromise = composeProvider(descriptors), await providerPromise, port.postMessage({ type: "init" });
  } catch (error) {
    providerPromise = void 0, port.postMessage({
      type: "init",
      error: errorToErrorLike(error)
    });
  }
}
async function handleExtract(id, entry) {
  try {
    if (!providerPromise)
      throw new Error("docgen worker received an extract request before init");
    let payload = await (await providerPromise)({ entry });
    port.postMessage({ type: "extract", id, payload });
  } catch (error) {
    port.postMessage({
      type: "extract",
      id,
      error: errorToErrorLike(error)
    });
  }
}
port.on("message", (msg) => {
  switch (msg.type) {
    case "init":
      handleInit(msg);
      return;
    case "extract":
      handleExtract(msg.id, msg.entry);
      return;
    default: {
      let _exhaustive = msg;
      throw new Error(`docgen worker received unknown message: ${JSON.stringify(_exhaustive)}`);
    }
  }
});
