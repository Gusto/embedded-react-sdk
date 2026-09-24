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
  resolveStorybookConfigDir
} from "./chunk-S7XIM54L.js";
import {
  ToolsRuntimeError,
  projectPathsEqual
} from "./chunk-F5UFNM2U.js";
import {
  clearToolsetRegistry,
  getRegisteredToolsets
} from "./chunk-5ZQGOLDE.js";
import "./chunk-52XR72NR.js";
import {
  clearRegistry
} from "./chunk-5EYYAT2W.js";
import "./chunk-2J2NU66Q.js";
import "./chunk-6WZPWJR4.js";
import "./chunk-DW727PJG.js";
import "./chunk-FE5AV6EP.js";
import "./chunk-VGN5LGMI.js";
import "./chunk-4US4PNS3.js";

// src/cli/tools/sdk/local-runtime.ts
import { resolve } from "node:path";
import {
  ChangeDetectionService,
  experimental_getStatusStore,
  experimental_loadStorybook,
  experimental_resetChangeDetectionReadiness,
  experimental_resetServicesPresetOnce,
  experimental_setChangeDetectionHost,
  getService,
  prepareHeadlessUniversalStores
} from "storybook/internal/core-server";
import { CHANGE_DETECTION_STATUS_TYPE_ID } from "storybook/internal/types";
async function bootstrapToolsRuntime(target, deps = {}) {
  let cwd = resolve(target.cwd ?? process.cwd());
  if (!projectPathsEqual(cwd, process.cwd()))
    throw new ToolsRuntimeError({
      reason: "mode-unavailable",
      message: `Local tools bootstrap requires process.cwd() to be the target project (${cwd}), not ${process.cwd()}.`
    });
  let configDir = resolveStorybookConfigDir({ cwd, configDir: target.configDir }), channel = prepareHeadlessUniversalStores(), options = await experimental_loadStorybook({ configDir, channel }), setChangeDetectionHost = deps.setChangeDetectionHost ?? experimental_setChangeDetectionHost;
  setChangeDetectionHost(() => startChangeDetectionInProcess(options));
  let closed = !1, close = async () => {
    closed || (closed = !0, clearRegistry(), clearToolsetRegistry(), experimental_resetServicesPresetOnce(), setChangeDetectionHost(void 0), experimental_resetChangeDetectionReadiness());
  };
  return {
    configDir,
    toolsets: getRegisteredToolsets(),
    getService: (serviceId, serviceOptions) => getService(serviceId, serviceOptions),
    close
  };
}
async function startChangeDetectionInProcess(options) {
  let changeDetectionService = new ChangeDetectionService({
    storyIndexGeneratorPromise: options.presets.apply("storyIndexGenerator"),
    statusStore: experimental_getStatusStore(CHANGE_DETECTION_STATUS_TYPE_ID),
    workingDir: process.cwd()
  }), features = await options.presets.apply("features");
  changeDetectionService.start(features?.changeDetection !== !1);
}
export {
  bootstrapToolsRuntime
};
