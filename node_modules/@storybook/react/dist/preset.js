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
  buildReactComponentDocgenFromResolved,
  buildStoryDocsFromResolved,
  cachedReadFileSync,
  extractArgTypes,
  getCodeSnippet,
  invalidateCache,
  invalidateParser,
  join,
  parseWithReactDocgen,
  posix,
  resolveStoryFileComponents
} from "./_node-chunks/chunk-PEK7NXDQ.js";

// src/preset.ts
import path2, { join as join3 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import { getProjectRoot } from "storybook/internal/common";

// ../../core/src/shared/utils/module.ts
import { createRequire, register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// ../../../node_modules/exsolve/dist/index.mjs
import assert from "node:assert";
import v8 from "node:v8";
import { format, inspect } from "node:util";
var own$1 = {}.hasOwnProperty, classRegExp = /^([A-Z][a-z\d]*)+$/, kTypes = /* @__PURE__ */ new Set([
  "string",
  "function",
  "number",
  "object",
  "Function",
  "Object",
  "boolean",
  "bigint",
  "symbol"
]), messages = /* @__PURE__ */ new Map(), nodeInternalPrefix = "__node_internal_", userStackTraceLimit;
function formatList(array, type = "and") {
  return array.length < 3 ? array.join(` ${type} `) : `${array.slice(0, -1).join(", ")}, ${type} ${array.at(-1)}`;
}
function createError(sym, value, constructor) {
  return messages.set(sym, value), makeNodeErrorWithCode(constructor, sym);
}
function makeNodeErrorWithCode(Base, key) {
  return function(...parameters) {
    let limit = Error.stackTraceLimit;
    isErrorStackTraceLimitWritable() && (Error.stackTraceLimit = 0);
    let error = new Base();
    isErrorStackTraceLimitWritable() && (Error.stackTraceLimit = limit);
    let message = getMessage(key, parameters, error);
    return Object.defineProperties(error, {
      message: {
        value: message,
        enumerable: !1,
        writable: !0,
        configurable: !0
      },
      toString: {
        value() {
          return `${this.name} [${key}]: ${this.message}`;
        },
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), captureLargerStackTrace(error), error.code = key, error;
  };
}
function isErrorStackTraceLimitWritable() {
  try {
    if (v8.startupSnapshot.isBuildingSnapshot()) return !1;
  } catch {
  }
  let desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  return desc === void 0 ? Object.isExtensible(Error) : own$1.call(desc, "writable") && desc.writable !== void 0 ? desc.writable : desc.set !== void 0;
}
function hideStackFrames(wrappedFunction) {
  let hidden = nodeInternalPrefix + wrappedFunction.name;
  return Object.defineProperty(wrappedFunction, "name", { value: hidden }), wrappedFunction;
}
var captureLargerStackTrace = hideStackFrames(function(error) {
  let stackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
  return stackTraceLimitIsWritable && (userStackTraceLimit = Error.stackTraceLimit, Error.stackTraceLimit = Number.POSITIVE_INFINITY), Error.captureStackTrace(error), stackTraceLimitIsWritable && (Error.stackTraceLimit = userStackTraceLimit), error;
});
function getMessage(key, parameters, self) {
  let message = messages.get(key);
  if (assert.ok(message !== void 0, "expected `message` to be found"), typeof message == "function")
    return assert.ok(message.length <= parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${message.length}).`), Reflect.apply(message, self, parameters);
  let regex = /%[dfijoOs]/g, expectedLength = 0;
  for (; regex.exec(message) !== null; ) expectedLength++;
  return assert.ok(expectedLength === parameters.length, `Code: ${key}; The provided arguments length (${parameters.length}) does not match the required ones (${expectedLength}).`), parameters.length === 0 ? message : (parameters.unshift(message), Reflect.apply(format, null, parameters));
}
function determineSpecificType(value) {
  if (value == null) return String(value);
  if (typeof value == "function" && value.name) return `function ${value.name}`;
  if (typeof value == "object")
    return value.constructor && value.constructor.name ? `an instance of ${value.constructor.name}` : `${inspect(value, { depth: -1 })}`;
  let inspected = inspect(value, { colors: !1 });
  return inspected.length > 28 && (inspected = `${inspected.slice(0, 25)}...`), `type ${typeof value} (${inspected})`;
}
var ERR_INVALID_ARG_TYPE = createError("ERR_INVALID_ARG_TYPE", (name, expected, actual) => {
  assert.ok(typeof name == "string", "'name' must be a string"), Array.isArray(expected) || (expected = [expected]);
  let message = "The ";
  if (name.endsWith(" argument")) message += `${name} `;
  else {
    let type = name.includes(".") ? "property" : "argument";
    message += `"${name}" ${type} `;
  }
  message += "must be ";
  let types = [], instances = [], other = [];
  for (let value of expected)
    assert.ok(typeof value == "string", "All expected entries have to be of type string"), kTypes.has(value) ? types.push(value.toLowerCase()) : classRegExp.exec(value) === null ? (assert.ok(value !== "object", 'The value "object" should be written as "Object"'), other.push(value)) : instances.push(value);
  if (instances.length > 0) {
    let pos = types.indexOf("object");
    pos !== -1 && (types.slice(pos, 1), instances.push("Object"));
  }
  return types.length > 0 && (message += `${types.length > 1 ? "one of type" : "of type"} ${formatList(types, "or")}`, (instances.length > 0 || other.length > 0) && (message += " or ")), instances.length > 0 && (message += `an instance of ${formatList(instances, "or")}`, other.length > 0 && (message += " or ")), other.length > 0 && (other.length > 1 ? message += `one of ${formatList(other, "or")}` : (other[0]?.toLowerCase() !== other[0] && (message += "an "), message += `${other[0]}`)), message += `. Received ${determineSpecificType(actual)}`, message;
}, TypeError), ERR_INVALID_MODULE_SPECIFIER = createError(
  "ERR_INVALID_MODULE_SPECIFIER",
  /**
  * @param {string} request
  * @param {string} reason
  * @param {string} [base]
  */
  (request, reason, base) => `Invalid module "${request}" ${reason}${base ? ` imported from ${base}` : ""}`,
  TypeError
), ERR_INVALID_PACKAGE_CONFIG = createError("ERR_INVALID_PACKAGE_CONFIG", (path$1, base, message) => `Invalid package config ${path$1}${base ? ` while importing ${base}` : ""}${message ? `. ${message}` : ""}`, Error), ERR_INVALID_PACKAGE_TARGET = createError("ERR_INVALID_PACKAGE_TARGET", (packagePath, key, target, isImport = !1, base) => {
  let relatedError = typeof target == "string" && !isImport && target.length > 0 && !target.startsWith("./");
  return key === "." ? (assert.ok(isImport === !1), `Invalid "exports" main target ${JSON.stringify(target)} defined in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? '; targets must start with "./"' : ""}`) : `Invalid "${isImport ? "imports" : "exports"}" target ${JSON.stringify(target)} defined for '${key}' in the package config ${packagePath}package.json${base ? ` imported from ${base}` : ""}${relatedError ? '; targets must start with "./"' : ""}`;
}, Error), ERR_MODULE_NOT_FOUND = createError("ERR_MODULE_NOT_FOUND", (path$1, base, exactUrl = !1) => `Cannot find ${exactUrl ? "module" : "package"} '${path$1}' imported from ${base}`, Error), ERR_NETWORK_IMPORT_DISALLOWED = createError("ERR_NETWORK_IMPORT_DISALLOWED", "import of '%s' by %s is not supported: %s", Error), ERR_PACKAGE_IMPORT_NOT_DEFINED = createError("ERR_PACKAGE_IMPORT_NOT_DEFINED", (specifier, packagePath, base) => `Package import specifier "${specifier}" is not defined${packagePath ? ` in package ${packagePath || ""}package.json` : ""} imported from ${base}`, TypeError), ERR_PACKAGE_PATH_NOT_EXPORTED = createError(
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
  /**
  * @param {string} packagePath
  * @param {string} subpath
  * @param {string} [base]
  */
  (packagePath, subpath, base) => subpath === "." ? `No "exports" main defined in ${packagePath}package.json${base ? ` imported from ${base}` : ""}` : `Package subpath '${subpath}' is not defined by "exports" in ${packagePath}package.json${base ? ` imported from ${base}` : ""}`,
  Error
), ERR_UNSUPPORTED_DIR_IMPORT = createError("ERR_UNSUPPORTED_DIR_IMPORT", "Directory import '%s' is not supported resolving ES modules imported from %s", Error), ERR_UNSUPPORTED_RESOLVE_REQUEST = createError("ERR_UNSUPPORTED_RESOLVE_REQUEST", 'Failed to resolve module specifier "%s" from "%s": Invalid relative URL or base scheme is not hierarchical.', TypeError), ERR_UNKNOWN_FILE_EXTENSION = createError("ERR_UNKNOWN_FILE_EXTENSION", (extension, path$1) => `Unknown file extension "${extension}" for ${path$1}`, TypeError), ERR_INVALID_ARG_VALUE = createError("ERR_INVALID_ARG_VALUE", (name, value, reason = "is invalid") => {
  let inspected = inspect(value);
  return inspected.length > 128 && (inspected = `${inspected.slice(0, 128)}...`), `The ${name.includes(".") ? "property" : "argument"} '${name}' ${reason}. Received ${inspected}`;
}, TypeError), hasOwnProperty$1 = {}.hasOwnProperty;
var hasOwnProperty = {}.hasOwnProperty;
var RegExpPrototypeSymbolReplace = RegExp.prototype[Symbol.replace], own = {}.hasOwnProperty;
var isWindows = process.platform === "win32", globalCache = globalThis.__EXSOLVE_CACHE__ ||= /* @__PURE__ */ new Map();

// ../../core/node_modules/pathe/dist/shared/pathe.ff20891b.mjs
var _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  return input && input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
var _UNC_REGEX = /^[/\\]{2}/, _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/, _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
var normalize = function(path3) {
  if (path3.length === 0)
    return ".";
  path3 = normalizeWindowsPath(path3);
  let isUNCPath = path3.match(_UNC_REGEX), isPathAbsolute = isAbsolute(path3), trailingSeparator = path3[path3.length - 1] === "/";
  return path3 = normalizeString(path3, !isPathAbsolute), path3.length === 0 ? isPathAbsolute ? "/" : trailingSeparator ? "./" : "." : (trailingSeparator && (path3 += "/"), _DRIVE_LETTER_RE.test(path3) && (path3 += "/"), isUNCPath ? isPathAbsolute ? `//${path3}` : `//./${path3}` : isPathAbsolute && !isAbsolute(path3) ? `/${path3}` : path3);
}, join2 = function(...arguments_) {
  if (arguments_.length === 0)
    return ".";
  let joined;
  for (let argument of arguments_)
    argument && argument.length > 0 && (joined === void 0 ? joined = argument : joined += `/${argument}`);
  return joined === void 0 ? "." : normalize(joined.replace(/\/\/+/g, "/"));
};
function normalizeString(path3, allowAboveRoot) {
  let res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, char = null;
  for (let index = 0; index <= path3.length; ++index) {
    if (index < path3.length)
      char = path3[index];
    else {
      if (char === "/")
        break;
      char = "/";
    }
    if (char === "/") {
      if (!(lastSlash === index - 1 || dots === 1)) if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            let lastSlashIndex = res.lastIndexOf("/");
            lastSlashIndex === -1 ? (res = "", lastSegmentLength = 0) : (res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/")), lastSlash = index, dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "", lastSegmentLength = 0, lastSlash = index, dots = 0;
            continue;
          }
        }
        allowAboveRoot && (res += res.length > 0 ? "/.." : "..", lastSegmentLength = 2);
      } else
        res.length > 0 ? res += `/${path3.slice(lastSlash + 1, index)}` : res = path3.slice(lastSlash + 1, index), lastSegmentLength = index - lastSlash - 1;
      lastSlash = index, dots = 0;
    } else char === "." && dots !== -1 ? ++dots : dots = -1;
  }
  return res;
}
var isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
var dirname = function(p) {
  let segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  return segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0]) && (segments[0] += "/"), segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

// ../../core/src/shared/utils/module.ts
var importMetaResolve = (...args) => typeof import.meta.resolve != "function" && process.env.VITEST === "true" ? (console.warn(
  "importMetaResolve from within Storybook is being used in a Vitest test, but it shouldn't be. Please report this at https://github.com/storybookjs/storybook/issues/new?template=bug_report.yml"
), pathToFileURL(args[0]).href) : import.meta.resolve(...args), resolvePackageDir = (pkg, parent) => {
  try {
    return dirname(fileURLToPath(importMetaResolve(join2(pkg, "package.json"), parent)));
  } catch {
    try {
      return dirname(fileURLToPath(importMetaResolve(join2(pkg, "package.json"))));
    } catch {
      let req = createRequire(parent ?? import.meta.url);
      return dirname(req.resolve(join2(pkg, "package.json")));
    }
  }
};

// src/componentManifest/reactDocgen/extractReactDocgenInfo.ts
import { logger } from "storybook/internal/node-logger";
function getComponentDocgen(filePath, componentName) {
  try {
    let code = cachedReadFileSync(filePath, "utf-8"), docgens = parseWithReactDocgen(code, filePath);
    if (docgens.length === 0)
      return null;
    if (componentName) {
      let matchingDocgen = docgens.find(
        (docgen) => docgen.actualName === componentName || docgen.displayName === componentName || docgen.exportName === componentName
      );
      return matchingDocgen ? {
        componentName: matchingDocgen.actualName || matchingDocgen.displayName || componentName,
        reactDocgen: { type: "success", data: matchingDocgen }
      } : null;
    }
    let firstDocgen = docgens[0];
    return {
      componentName: firstDocgen.actualName || firstDocgen.displayName || "Unknown",
      reactDocgen: { type: "success", data: firstDocgen }
    };
  } catch (error) {
    return logger.debug(`Error parsing component file for docgen ${filePath}: ${error}`), null;
  }
}
var extractArgTypesFromDocgen = ({
  componentFilePath,
  componentExportName
}) => {
  let docgen = getComponentDocgen(componentFilePath, componentExportName);
  return !docgen || docgen.reactDocgen.type !== "success" ? null : extractArgTypes({ __docgenInfo: docgen.reactDocgen.data }) ?? {};
};

// src/componentManifest/reactDocgen/extractReactTypescriptDocgenInfo.ts
import { logger as logger2 } from "storybook/internal/node-logger";

// src/componentManifest/reactDocgen/utils.ts
import { findTsconfigPathForFile } from "storybook/internal/common";
import { dirname as dirname2 } from "node:path";
var REACT_NODE_TYPES = /* @__PURE__ */ new Set([
  "JSX.Element",
  "ComponentType",
  "ReactComponentType",
  "ReactElement",
  "ReactReactElement",
  "ElementType",
  "ReactElementType",
  "ReactNode",
  "ReactReactNode"
]), KNOWN_TYPE_NAMES = /* @__PURE__ */ new Set([
  "boolean",
  "string",
  "number",
  "Date",
  ...REACT_NODE_TYPES,
  "signature",
  "union",
  "Array",
  "tuple",
  "literal",
  "null",
  "void",
  "any",
  "unknown"
]);
var getTsConfig = async (componentFilePath) => {
  try {
    let ts = await import("typescript"), tsconfigPath = componentFilePath ? findTsconfigPathForFile(dirname2(componentFilePath), componentFilePath) : ts.findConfigFile(process.cwd(), ts.sys.fileExists);
    if (tsconfigPath === void 0)
      return {};
    let basePath = dirname2(tsconfigPath), { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    return error ? {} : ts.parseJsonConfigFileContent(config, ts.sys, basePath, {}, tsconfigPath).options;
  } catch {
    return {};
  }
};

// src/componentManifest/reactDocgen/extractReactTypescriptDocgenInfo.ts
var extractArgTypesFromDocgenTypescript = async ({
  componentFilePath,
  componentExportName,
  reactDocgenTypescriptOptions
}) => {
  try {
    let { withCompilerOptions } = (await import("react-docgen-typescript")).default, defaultOptions = {
      shouldExtractLiteralValuesFromEnum: !0,
      shouldRemoveUndefinedFromOptional: !0,
      propFilter: (prop) => prop.parent ? !/node_modules/.test(prop.parent.fileName) : !0,
      // We *need* this set so that RDT returns default values in the same format as react-docgen
      savePropValueAsString: !0
    }, tsConfig = await getTsConfig(componentFilePath), mergedOptions = {
      ...defaultOptions,
      ...reactDocgenTypescriptOptions,
      // Always ensure savePropValueAsString is true for consistency
      savePropValueAsString: !0
    }, docgens = withCompilerOptions(
      { ...tsConfig, noErrorTruncation: !0, strict: !0 },
      mergedOptions
    ).parse(componentFilePath);
    if (!docgens || docgens.length === 0)
      return null;
    let targetDocgen = docgens[0];
    if (componentExportName) {
      let match = docgens.find(
        (d) => d.displayName === componentExportName || d.filePath?.includes(componentExportName)
      );
      if (match)
        targetDocgen = match;
      else
        return null;
    }
    return extractArgTypes({ __docgenInfo: targetDocgen }) ?? {};
  } catch (error) {
    return logger2.debug(
      `Error parsing component file with react-docgen-typescript ${componentFilePath}: ${error}`
    ), null;
  }
};

// src/componentManifest/generator.ts
import {
  getStoryImportPathFromEntry,
  selectComponentEntriesByComponentId
} from "storybook/internal/common";

// src/componentManifest/componentMetaManagerSingleton.ts
import { logger as logger3 } from "storybook/internal/node-logger";
var componentMetaManagerPromise;
function getSharedComponentMetaManager() {
  return componentMetaManagerPromise || (componentMetaManagerPromise = (async () => {
    try {
      let ts = await import("typescript");
      return new ComponentMetaManager(ts);
    } catch {
      logger3.debug(
        "[reactComponentMeta] TypeScript not available, skipping component meta extraction."
      );
      return;
    }
  })()), componentMetaManagerPromise;
}

// src/componentManifest/generator.ts
var manifests = async (existingManifests = {}, options) => {
  let { manifestEntries, presets, watch } = options, typescriptOptions = await presets?.apply("typescript", {}) ?? {}, features = await presets?.apply("features", {});
  if (features?.experimentalDocgenServer)
    return {
      ...existingManifests,
      components: {
        v: 0,
        components: {},
        meta: { docgen: "react-component-meta", durationMs: 0 }
      }
    };
  let docgenEngine = features?.experimentalReactComponentMeta ? "react-component-meta" : typescriptOptions.reactDocgen || "react-docgen";
  invalidateCache(), invalidateParser();
  let startTime = performance.now(), manager = docgenEngine === "react-component-meta" ? await getSharedComponentMetaManager() : void 0, entriesByUniqueComponent = [
    ...selectComponentEntriesByComponentId(manifestEntries).values()
  ], resolvedEntries = await Promise.all(
    entriesByUniqueComponent.map(async (entry) => {
      let storyFilePath = getStoryImportPathFromEntry(entry);
      if (!storyFilePath)
        throw new Error(`No story file path for index entry ${entry.id}`);
      let storyPath = posix.join(process.cwd(), storyFilePath), resolved = await resolveStoryFileComponents({
        storyPath,
        title: entry.title,
        typescriptOptions,
        docgenEngine
      });
      return { entry, storyFilePath, ...resolved };
    })
  );
  docgenEngine === "react-component-meta" && manager && manager.batchExtract(
    resolvedEntries.flatMap(({ storyPath, component, subcomponents }) => [
      ...component ? [{ storyPath, component }] : [],
      ...subcomponents.filter(
        (subcomponent) => subcomponent.component !== void 0
      ).map((subcomponent) => ({
        storyPath,
        component: subcomponent.component
      }))
    ])
  );
  let manifestEntryIds = new Set(manifestEntries.map((entry) => entry.id)), components = resolvedEntries.map(
    ({
      storyPath,
      component,
      entry,
      storyFilePath,
      storyFile,
      csf,
      componentName,
      allComponents,
      subcomponents
    }) => buildReactComponentDocgenFromResolved({
      entry,
      storyPath,
      storyFilePath,
      storyFile,
      csf,
      componentName,
      component,
      allComponents,
      subcomponents,
      docgenEngine,
      filterStoryIds: manifestEntryIds
    })
  ).filter((component) => component !== void 0);
  manager && watch && manager.startWatching();
  let durationMs = Math.round(performance.now() - startTime);
  return {
    ...existingManifests,
    components: {
      v: 0,
      components: Object.fromEntries(components.map((component) => [component.id, component])),
      meta: {
        docgen: docgenEngine,
        durationMs
      }
    }
  };
};

// src/enrichCsf.ts
import { recast, types as t } from "storybook/internal/babel";
import { getPrettier } from "storybook/internal/common";
var enrichCsf = async (input, options) => {
  let features = await options.presets.apply("features");
  if (!(!features.experimentalCodeExamples || features.experimentalDocgenServer))
    return async (csf, csfSource) => {
      let promises = Object.keys(csf._stories).map(async (key) => {
        if (!csfSource._meta?.component)
          return;
        let { format: format3 } = await getPrettier(), node, snippet;
        try {
          node = getCodeSnippet(csfSource, key, csfSource._meta?.component).node;
        } catch (e) {
          if (!(e instanceof Error))
            return;
          snippet = e.message;
        }
        try {
          !snippet && node && (snippet = await format3(recast.print(node).code, {
            filepath: join(process.cwd(), "component.tsx")
          }));
        } catch (e) {
          if (!(e instanceof Error))
            return;
          snippet = e.message;
        }
        if (!snippet)
          return;
        let originalParameters = t.memberExpression(
          csf._metaIsFactory ? t.memberExpression(t.identifier(key), t.identifier("input")) : t.identifier(key),
          t.identifier("parameters")
        ), docsParameter = t.optionalMemberExpression(
          originalParameters,
          t.identifier("docs"),
          !1,
          !0
        );
        csf._ast.program.body.push(
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              originalParameters,
              t.objectExpression([
                t.spreadElement(originalParameters),
                t.objectProperty(
                  t.identifier("docs"),
                  t.objectExpression([
                    t.spreadElement(docsParameter),
                    t.objectProperty(
                      t.identifier("source"),
                      t.objectExpression([
                        t.objectProperty(t.identifier("code"), t.stringLiteral(snippet)),
                        t.spreadElement(
                          t.optionalMemberExpression(
                            docsParameter,
                            t.identifier("source"),
                            !1,
                            !0
                          )
                        )
                      ])
                    )
                  ])
                )
              ])
            )
          )
        );
      });
      await Promise.all(promises);
    };
};

// src/docgen/preset.ts
import { fileURLToPath as fileURLToPath2 } from "node:url";
var experimental_docgenProvider = async (existing = []) => [
  ...existing,
  {
    moduleSpecifier: fileURLToPath2(import.meta.resolve("@storybook/react/internal/docgen-worker"))
  }
];

// src/docgen/story-docs-preset.ts
import { STORY_FILE_TEST_REGEXP, getStoryImportPathFromEntry as getStoryImportPathFromEntry3 } from "storybook/internal/common";

// src/docgen/build-story-docs.ts
import { getStoryImportPathFromEntry as getStoryImportPathFromEntry2 } from "storybook/internal/common";
async function buildStoryDocsPayload(input, context) {
  let storyFilePath = getStoryImportPathFromEntry2(input.entry);
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
  let { csf, componentName, component, allComponents } = resolved;
  return buildStoryDocsFromResolved({
    entry: input.entry,
    storyPath,
    storyFilePath,
    csf,
    componentName,
    component,
    allComponents
  });
}

// src/docgen/story-docs-preset.ts
var experimental_storyDocsProvider = async (nextStoryDocs, options) => {
  let typescriptOptionsPromise = options.presets?.apply(
    "typescript",
    {}
  ) ?? Promise.resolve({});
  return async (input) => {
    let storyImportPath = getStoryImportPathFromEntry3(input.entry);
    if (!storyImportPath || !STORY_FILE_TEST_REGEXP.test(storyImportPath))
      return nextStoryDocs(input);
    let ours = await buildStoryDocsPayload(input, {
      typescriptOptions: await typescriptOptionsPromise
    });
    return ours ? { ...await nextStoryDocs(input), ...ours } : nextStoryDocs(input);
  };
};

// src/preset.ts
var addons = [
  import.meta.resolve("@storybook/react-dom-shim/preset")
], previewAnnotations = async (input = [], options) => {
  let [docsConfig, features] = await Promise.all([
    options.presets.apply("docs", {}, options),
    options.presets.apply("features", {}, options)
  ]), docsEnabled = Object.keys(docsConfig).length > 0, experimentalRSC = features?.experimentalRSC;
  return [].concat(input).concat([
    fileURLToPath3(import.meta.resolve("@storybook/react/entry-preview")),
    fileURLToPath3(import.meta.resolve("@storybook/react/entry-preview-argtypes"))
  ]).concat(
    docsEnabled ? [fileURLToPath3(import.meta.resolve("@storybook/react/entry-preview-docs"))] : []
  ).concat(
    experimentalRSC ? [fileURLToPath3(import.meta.resolve("@storybook/react/entry-preview-rsc"))] : []
  );
}, resolvedReact = async (existing) => {
  try {
    return {
      ...existing,
      react: resolvePackageDir("react"),
      reactDom: resolvePackageDir("react-dom")
    };
  } catch {
    return existing;
  }
};
async function internal_getArgTypesData(_input, options) {
  let { componentFilePath, componentExportName, presets } = options ?? {};
  if (!componentFilePath)
    return null;
  let typescriptOptions = {};
  if (presets)
    try {
      typescriptOptions = await presets.apply("typescript", {});
    } catch {
    }
  let { reactDocgen = "react-docgen", reactDocgenTypescriptOptions } = typescriptOptions;
  if (reactDocgen === !1)
    return null;
  let resolvedFilePath = path2.isAbsolute(componentFilePath) ? componentFilePath : join3(getProjectRoot(), componentFilePath), argTypesData;
  return reactDocgen === "react-docgen-typescript" ? argTypesData = await extractArgTypesFromDocgenTypescript({
    componentFilePath: resolvedFilePath,
    componentExportName,
    reactDocgenTypescriptOptions
  }) : argTypesData = extractArgTypesFromDocgen({
    componentFilePath: resolvedFilePath,
    componentExportName
  }), argTypesData;
}
var optimizeViteDeps = ["react-dom/test-utils"];
export {
  addons,
  experimental_docgenProvider,
  enrichCsf as experimental_enrichCsf,
  manifests as experimental_manifests,
  experimental_storyDocsProvider,
  internal_getArgTypesData,
  optimizeViteDeps,
  previewAnnotations,
  resolvedReact
};
