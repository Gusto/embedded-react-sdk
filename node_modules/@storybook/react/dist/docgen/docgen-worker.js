import CJS_COMPAT_NODE_URL_4qsk4z45rci from 'node:url';
import CJS_COMPAT_NODE_PATH_4qsk4z45rci from 'node:path';
import CJS_COMPAT_NODE_MODULE_4qsk4z45rci from "node:module";

var __filename = CJS_COMPAT_NODE_URL_4qsk4z45rci.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_4qsk4z45rci.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_4qsk4z45rci.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------
import {
  ComponentMetaManager,
  buildComponentDocgenFromResolved,
  extractArgTypes,
  posix,
  resolveStoryFileComponents
} from "../_node-chunks/chunk-PEK7NXDQ.js";

// src/docgen/docgen-worker.ts
import { createLazyDocgenMiddleware } from "storybook/internal/common";

// src/docgen/buildDocgen.ts
import { getStoryImportPathFromEntry } from "storybook/internal/common";
function extractArgTypesFromComponentMeta(componentMeta) {
  return componentMeta ? extractArgTypes({ __docgenInfo: componentMeta }) ?? void 0 : void 0;
}
function addArgTypesFromComponentMeta(payload) {
  let argTypes = extractArgTypesFromComponentMeta(payload.reactComponentMeta), subcomponents = payload.subcomponents ? Object.fromEntries(
    Object.entries(payload.subcomponents).map(([name, subcomponent]) => [
      name,
      {
        ...subcomponent,
        argTypes: extractArgTypesFromComponentMeta(subcomponent.reactComponentMeta)
      }
    ])
  ) : void 0;
  return {
    ...payload,
    ...argTypes ? { argTypes } : {},
    ...subcomponents ? { subcomponents } : {}
  };
}
async function buildDocgenPayload(input, context) {
  let storyFilePath = getStoryImportPathFromEntry(input.entry);
  if (!storyFilePath)
    return;
  let storyPath = (context.resolvePath ?? ((importPath) => posix.join(process.cwd(), importPath)))(storyFilePath), resolved;
  try {
    resolved = await resolveStoryFileComponents({
      storyPath,
      title: input.entry.title,
      typescriptOptions: context.typescriptOptions,
      docgenEngine: "react-component-meta"
    });
  } catch {
    return;
  }
  let { csf, componentName, component, subcomponents, storyFile } = resolved, usableSubcomponents = subcomponents.filter(
    (sub) => sub.component !== void 0
  ), storyRefs = [
    ...component ? [{ storyPath, component }] : [],
    ...usableSubcomponents.map((sub) => ({ storyPath, component: sub.component }))
  ];
  storyRefs.length > 0 && context.componentMetaManager.batchExtract(storyRefs);
  let componentDocgen = buildComponentDocgenFromResolved({
    entry: input.entry,
    storyPath,
    storyFilePath,
    storyFile,
    csf,
    componentName,
    component,
    subcomponents,
    docgenEngine: "react-component-meta"
  });
  return addArgTypesFromComponentMeta(componentDocgen);
}

// src/docgen/docgen-worker.ts
var createDocgenProvider = () => createLazyDocgenMiddleware({
  createManager: async () => {
    try {
      let ts = await import("typescript");
      return new ComponentMetaManager(ts);
    } catch {
      return;
    }
  },
  extract: (componentMetaManager, input) => buildDocgenPayload(input, { componentMetaManager })
});
export {
  createDocgenProvider
};
