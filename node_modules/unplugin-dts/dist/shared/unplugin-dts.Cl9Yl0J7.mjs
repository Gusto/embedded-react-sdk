
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
import { isAbsolute, posix, resolve as resolve$1, dirname, normalize, sep, relative, basename } from 'node:path';
import { existsSync, readdirSync, lstatSync, rmdirSync } from 'node:fs';
import require$$0, { createRequire } from 'node:module';
import globToRegExp from 'glob-to-regexp';
import { yellow, green, red, cyan } from 'kolorist';
import { performance } from 'node:perf_hooks';
import { readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { createFilter } from '@rollup/pluginutils';
import { compare } from 'compare-versions';
import debug from 'debug';
import { getPackageInfoSync, resolveModule } from 'local-pkg';
import MagicString from 'magic-string';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var tsLoader;
var hasRequiredTsLoader;

function requireTsLoader () {
	if (hasRequiredTsLoader) return tsLoader;
	hasRequiredTsLoader = 1;
	const { createRequire } = require$$0;
	const require_ = createRequire(__filename);
	function loadTs() {
	  try {
	    const ts = require_("typescript");
	    if (typeof ts.createProgram === "function") {
	      return ts;
	    }
	  } catch {
	  }
	  try {
	    const ts = require_("@typescript/typescript6");
	    if (typeof ts.createProgram === "function") {
	      return ts;
	    }
	  } catch {
	  }
	  throw new Error(
	    '[unplugin-dts] The installed "typescript" package does not provide the JavaScript Compiler API (this happens with TypeScript 7+), and the fallback "@typescript/typescript6" was not found.\nPlease install it alongside TypeScript 7:\n  npm install -D @typescript/typescript6\nThis allows TypeScript 7 to be used for compilation while keeping the JS API available for tooling.\nSee: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/'
	  );
	}
	tsLoader = loadTs();
	return tsLoader;
}

var tsLoaderExports = requireTsLoader();
const ts = /*@__PURE__*/getDefaultExportFromCjs(tsLoaderExports);

function measureIntervals(intervals) {
  if (intervals.length === 0) {
    return { sum: 0, union: 0, maxConcurrency: 0 };
  }
  const sum = intervals.reduce((total, interval) => total + interval.end - interval.start, 0);
  const points = intervals.flatMap((interval) => [
    { time: interval.start, delta: 1 },
    { time: interval.end, delta: -1 }
  ]);
  points.sort((left, right) => {
    if (left.time === right.time) return left.delta - right.delta;
    return left.time - right.time;
  });
  let active = 0;
  let maxConcurrency = 0;
  let previous = points[0].time;
  let union = 0;
  for (const point of points) {
    if (active > 0) union += point.time - previous;
    active += point.delta;
    maxConcurrency = Math.max(maxConcurrency, active);
    previous = point.time;
  }
  return { sum, union, maxConcurrency };
}
class BuildTimeTracker {
  now;
  generation = 0;
  cycleStart = 0;
  intervals = [];
  constructor(now = () => performance.now()) {
    this.now = now;
    this.reset();
  }
  reset(start = this.now()) {
    this.generation++;
    this.cycleStart = start;
    this.intervals = [];
  }
  begin(hook) {
    return { hook, start: this.now(), generation: this.generation };
  }
  end(token) {
    if (token.generation !== this.generation) return;
    const end = this.now();
    this.intervals.push({ hook: token.hook, start: token.start, end });
  }
  async track(hook, action) {
    const interval = this.begin(hook);
    try {
      return await action();
    } finally {
      this.end(interval);
    }
  }
  getIntervals() {
    return [...this.intervals].sort((left, right) => left.start - right.start);
  }
  summarize(end = this.now()) {
    const intervals = this.getIntervals();
    const all = measureIntervals(intervals);
    const phase = (hook) => measureIntervals(intervals.filter((interval) => interval.hook === hook));
    const transforms = phase("transform");
    const wallMs = Math.max(0, end - this.cycleStart);
    return {
      wallMs,
      attributedMs: all.union,
      unattributedMs: Math.max(0, wallMs - all.union),
      buildStartMs: phase("buildStart").union,
      watchChangeMs: phase("watchChange").union,
      transformSumMs: transforms.sum,
      transformUnionMs: transforms.union,
      transformMaxConcurrency: transforms.maxConcurrency,
      transformOverlapMs: transforms.sum - transforms.union,
      writeBundleMs: phase("writeBundle").union
    };
  }
}

async function loadProgramProcessor(type = "ts") {
  if (type === "vue") {
    try {
      const mod = await import('../chunks/vue.mjs');
      return mod.default ?? mod;
    } catch {
      const mod = await import('../chunks/vue.mjs');
      return mod.default ?? mod;
    }
  }
  try {
    const mod = await import('../chunks/ts.mjs');
    return mod.default ?? mod;
  } catch {
    const mod = await import('../chunks/ts.mjs');
    return mod.default ?? mod;
  }
}

const handleDebug = debug("dts-debug");
const defaultIndex = "index.d.ts";
const jsRE = /\.([cm])?jsx?$/;
const tsRE = /\.([cm])?tsx?$/;
const dtsRE$1 = /\.d\.([cm])?tsx?$/;
const tjsRE = /\.([cm])?([jt])sx?$/;
const mtjsRE = /\.m([jt])sx?$/;
const ctjsRE = /\.c([jt])sx?$/;
const fullRelativeRE = /^\.\.?\//;
const globSignRE = /[-^$*+?.()|[\]{}]/g;
function getJsExtPrefix(file) {
  return mtjsRE.test(file) ? "m" : ctjsRE.test(file) ? "c" : "";
}
function tsToDtsWithExtension(path, dtsExtension = ".d.ts") {
  return `${path.replace(tsRE, "")}${dtsExtension}`;
}
const windowsSlashRE = /\\+/g;
function slash(p) {
  return p.replace(windowsSlashRE, "/");
}
function resolveConfigDir(path, configDir) {
  return path.startsWith("${configDir}") ? path.replace("${configDir}", configDir) : path;
}
function normalizePath(id) {
  return posix.normalize(slash(id));
}
function resolve(...paths) {
  return normalizePath(resolve$1(...paths));
}
function isNativeObj(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function isRegExp(value) {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}
function isPromise(value) {
  return !!value && (typeof value === "function" || typeof value === "object") && typeof value.then === "function";
}
async function unwrapPromise(maybePromise) {
  return isPromise(maybePromise) ? await maybePromise : maybePromise;
}
function mergeObjects(sourceObj, targetObj) {
  const loop = [
    {
      source: sourceObj,
      target: targetObj
      // merged: mergedObj
    }
  ];
  while (loop.length) {
    const { source, target } = loop.pop();
    Object.keys(target).forEach((key) => {
      if (isNativeObj(target[key])) {
        if (!isNativeObj(source[key])) {
          source[key] = {};
        }
        loop.push({
          source: source[key],
          target: target[key]
        });
      } else if (Array.isArray(target[key])) {
        if (!Array.isArray(source[key])) {
          source[key] = [];
        }
        loop.push({
          source: source[key],
          target: target[key]
        });
      } else {
        source[key] = target[key];
      }
    });
  }
  return sourceObj;
}
function ensureAbsolute(path, root) {
  return normalizePath(path ? isAbsolute(path) ? path : resolve(root, path) : root);
}
function ensureArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}
async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);
    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}
const speRE = /[\\/]/;
function queryPublicPath(paths) {
  if (paths.length === 0) {
    return "";
  } else if (paths.length === 1) {
    return dirname(paths[0]);
  }
  let publicPath = normalize(dirname(paths[0])) + sep;
  let publicUnits = publicPath.split(speRE);
  let index = publicUnits.length - 1;
  for (const path of paths.slice(1)) {
    if (!index) {
      return publicPath;
    }
    const dirPath = normalize(dirname(path)) + sep;
    if (dirPath.startsWith(publicPath)) {
      continue;
    }
    const units = dirPath.split(speRE);
    if (units.length < index) {
      publicPath = dirPath;
      publicUnits = units;
      continue;
    }
    for (let i = 0; i <= index; ++i) {
      if (publicUnits[i] !== units[i]) {
        if (!i) {
          return "";
        }
        index = i - 1;
        publicUnits = publicUnits.slice(0, index + 1);
        publicPath = publicUnits.join(sep) + sep;
        break;
      }
    }
  }
  return publicPath.slice(0, -1);
}
function removeDirIfEmpty(dir) {
  if (!existsSync(dir)) {
    return;
  }
  let onlyHasDir = true;
  for (const file of readdirSync(dir)) {
    const abs = resolve(dir, file);
    if (lstatSync(abs).isDirectory()) {
      if (!removeDirIfEmpty(abs)) {
        onlyHasDir = false;
      }
    } else {
      onlyHasDir = false;
    }
  }
  if (onlyHasDir) {
    rmdirSync(dir);
  }
  return onlyHasDir;
}
function getTsConfig(tsConfigPath, readFileSync) {
  const baseConfig = ts.readConfigFile(tsConfigPath, readFileSync).config ?? {};
  const tsConfig = {
    ...baseConfig,
    compilerOptions: {}
  };
  if (tsConfig.extends) {
    ensureArray(tsConfig.extends).forEach((configPath) => {
      const config = getTsConfig(ensureAbsolute(configPath, dirname(tsConfigPath)), readFileSync);
      Object.assign(tsConfig.compilerOptions, config.compilerOptions);
      if (!tsConfig.include) {
        tsConfig.include = config.include;
      }
      if (!tsConfig.exclude) {
        tsConfig.exclude = config.exclude;
      }
    });
  }
  Object.assign(tsConfig.compilerOptions, baseConfig.compilerOptions);
  return tsConfig;
}
function getTsLibFolder() {
  const libFolder = tryGetPackageInfo("typescript")?.rootPath;
  return libFolder && normalizePath(libFolder);
}
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
function base64Encode(number) {
  if (number >= 0 && number < BASE64_ALPHABET.length) {
    return BASE64_ALPHABET[number];
  }
  throw new TypeError("Base64 integer must be between 0 and 63: " + number);
}
const VLQ_BASE_SHIFT = 5;
const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
const VLQ_BASE_MASK = VLQ_BASE - 1;
const VLQ_CONTINUATION_BIT = VLQ_BASE;
function toVLQSigned(number) {
  return number < 0 ? (-number << 1) + 1 : (number << 1) + 0;
}
function base64VLQEncode(numbers) {
  let encoded = "";
  for (const number of numbers) {
    let vlq = toVLQSigned(number);
    let digit;
    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64Encode(digit);
    } while (vlq > 0);
  }
  return encoded;
}
const pkgPathCache = /* @__PURE__ */ new Map();
function tryGetPkgPath(beginPath) {
  beginPath = normalizePath(beginPath);
  if (pkgPathCache.has(beginPath)) {
    return pkgPathCache.get(beginPath);
  }
  const pkgPath = resolve(beginPath, "package.json");
  if (existsSync(pkgPath)) {
    pkgPathCache.set(beginPath, pkgPath);
    return pkgPath;
  }
  const parentDir = normalizePath(dirname(beginPath));
  if (!parentDir || parentDir === beginPath) {
    pkgPathCache.set(beginPath, void 0);
    return;
  }
  return tryGetPkgPath(parentDir);
}
function toCapitalCase(value) {
  value = value.trim().replace(/\s+/g, "-");
  value = value.replace(/-+(\w)/g, (_, char) => char ? char.toUpperCase() : "");
  return (value.charAt(0).toLocaleUpperCase() + value.slice(1)).replace(
    /[^\w]/g,
    ""
  );
}
function findTypesPath(...pkgs) {
  let path;
  for (const pkg of pkgs) {
    if (typeof pkg !== "object") continue;
    path = pkg.types || pkg.typings || pkg.exports?.types || pkg.exports?.["."]?.types || pkg.exports?.["./"]?.types;
    if (path) return path;
  }
}
function setModuleResolution(options) {
  if (options.moduleResolution) return;
  const module = typeof options.module === "number" ? options.module : (options.target ?? ts.ScriptTarget.ES5) >= ts.ScriptTarget.ES2015 ? ts.ModuleKind.ES2015 : ts.ModuleKind.CommonJS;
  let moduleResolution;
  switch (module) {
    case ts.ModuleKind.CommonJS:
      moduleResolution = ts.ModuleResolutionKind.Node10;
      break;
    case ts.ModuleKind.Node16:
      moduleResolution = ts.ModuleResolutionKind.Node16;
      break;
    case ts.ModuleKind.NodeNext:
      moduleResolution = ts.ModuleResolutionKind.NodeNext;
      break;
    default:
      moduleResolution = resolveESModuleResolution(ts.ModuleResolutionKind);
      break;
  }
  options.moduleResolution = moduleResolution;
}
function resolveESModuleResolution(moduleResolutionKind) {
  return moduleResolutionKind.Bundler ?? moduleResolutionKind.Classic;
}
function editSourceMapDir(content, fromDir, toDir) {
  const relativeOutDir = relative(fromDir, toDir);
  if (relativeOutDir) {
    try {
      const sourceMap = JSON.parse(content);
      sourceMap.sources = sourceMap.sources.map((source) => {
        return normalizePath(relative(relativeOutDir, source));
      });
      return JSON.stringify(sourceMap);
    } catch (e) {
      return false;
    }
  }
  return true;
}
const regexpSymbolRE = /([$.\\+?()[\]!<=|{}^,])/g;
const asteriskRE = /[*]+/g;
function parseTsAliases(basePath, paths) {
  const result = [];
  for (const [pathWithAsterisk, replacements] of Object.entries(paths)) {
    const find = new RegExp(
      `^${pathWithAsterisk.replace(regexpSymbolRE, "\\$1").replace(asteriskRE, "(?!\\.{1,2}\\/)([^*]+)")}$`
    );
    let index = 1;
    result.push({
      find,
      replacement: ensureAbsolute(
        replacements[0].replace(asteriskRE, () => `$${index++}`),
        basePath
      )
    });
  }
  return result;
}
const rootAsteriskImportRE = /^(?!\.{1,2}\/)([^*]+)$/;
function isAliasGlobal(alias) {
  return alias.find.toString() === rootAsteriskImportRE.toString();
}
function importResolves(path) {
  const files = [
    // js
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    // ts
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
    ".d.ts",
    // json
    ".json",
    // vue
    ".vue",
    ".vue.d.ts",
    // svelte
    ".svelte"
  ];
  for (const ext of files) {
    if (existsSync(path + ext)) {
      return true;
    }
  }
  return false;
}
function tryGetPackageInfo(name) {
  if (process.versions.pnp) {
    const targetRequire = createRequire(import.meta.url);
    try {
      return getPackageInfoSync(
        targetRequire.resolve(`${name}/package.json`, { paths: [process.cwd()] })
      );
    } catch (e) {
    }
  }
  try {
    return getPackageInfoSync(name) ?? getPackageInfoSync(name, { paths: [resolveModule(name) || process.cwd()] });
  } catch (e) {
  }
}
function getDtsExtension(moduleFormat) {
  switch (moduleFormat) {
    case "cjs":
      return ".d.cts";
    case "esm":
      return ".d.mts";
    default:
      return ".d.ts";
  }
}
function getMapExtension(moduleFormat) {
  switch (moduleFormat) {
    case "cjs":
      return ".d.cts.map";
    case "esm":
      return ".d.mts.map";
    default:
      return ".d.ts.map";
  }
}
function isOutDirConfig(value) {
  return isNativeObj(value) && typeof value.dir === "string";
}
function normalizeOutDirItem(item, root) {
  if (typeof item === "string") {
    return {
      dir: ensureAbsolute(item, root),
      moduleFormat: void 0,
      dtsExtension: ".d.ts",
      mapExtension: ".d.ts.map"
    };
  }
  const moduleFormat = item.moduleFormat;
  return {
    dir: ensureAbsolute(item.dir || "", root),
    moduleFormat,
    dtsExtension: getDtsExtension(moduleFormat),
    mapExtension: getMapExtension(moduleFormat)
  };
}
function normalizeOutDirs(outDirs, root, defaultDir) {
  if (outDirs === void 0 || outDirs === null) {
    return [normalizeOutDirItem(defaultDir, root)];
  }
  if (typeof outDirs === "string") {
    return [normalizeOutDirItem(outDirs, root)];
  }
  if (isOutDirConfig(outDirs)) {
    return [normalizeOutDirItem(outDirs, root)];
  }
  if (Array.isArray(outDirs)) {
    if (outDirs.length === 0) {
      return [normalizeOutDirItem(defaultDir, root)];
    }
    return outDirs.map((item) => normalizeOutDirItem(item, root));
  }
  return [normalizeOutDirItem(defaultDir, root)];
}
function transformDtsPath(filePath, targetExtension) {
  if (targetExtension === ".d.ts") {
    return filePath;
  }
  if (filePath.endsWith(".d.ts.map")) {
    const mapExtension = targetExtension === ".d.cts" ? ".d.cts.map" : ".d.mts.map";
    return filePath.slice(0, -9) + mapExtension;
  }
  if (filePath.endsWith(".d.ts")) {
    return filePath.slice(0, -5) + targetExtension;
  }
  return filePath;
}
function cleanVueDtsFileName(filePath) {
  return filePath.replace(".vue.d.ts", ".d.ts").replace(".vue.d.cts", ".d.cts").replace(".vue.d.mts", ".d.mts");
}
function transformSourceMappingURL(content, targetMapExtension) {
  if (targetMapExtension === ".d.ts.map") {
    return content;
  }
  return content.replace(
    /\/\/# sourceMappingURL=(.+)\.d\.ts\.map$/m,
    `//# sourceMappingURL=$1${targetMapExtension}`
  );
}

let hasExtractor;
function getHasExtractor() {
  return typeof hasExtractor !== "undefined" ? hasExtractor : hasExtractor = !!tryGetPackageInfo("@microsoft/api-extractor");
}
const dtsRE = /\.d\.(m|c)?tsx?$/;
async function bundleDtsFiles({
  root,
  configPath,
  tsconfigPath,
  compilerOptions,
  outDir,
  entryPath,
  outputPath,
  fileName,
  libFolder,
  extractorConfig = {},
  bundledPackages,
  invokeOptions = {}
}) {
  const { Extractor, ExtractorConfig } = await import('@microsoft/api-extractor');
  configPath = configPath ? ensureAbsolute(configPath, root) : "";
  const configObjectFullPath = configPath || resolve(root, "api-extractor.json");
  if (!dtsRE.test(fileName)) {
    fileName += ".d.ts";
  }
  if (/preserve/i.test(compilerOptions.module)) {
    compilerOptions = { ...compilerOptions, module: "ESNext" };
  }
  const configObject = {
    bundledPackages,
    projectFolder: root,
    mainEntryPointFilePath: entryPath,
    compiler: {
      tsconfigFilePath: tsconfigPath,
      overrideTsconfig: {
        $schema: "http://json.schemastore.org/tsconfig",
        compilerOptions
      }
    },
    apiReport: {
      enabled: false,
      reportFileName: "<unscopedPackageName>.api.md"
    },
    docModel: {
      enabled: false
    },
    dtsRollup: {
      enabled: true,
      publicTrimmedFilePath: outputPath ?? resolve(outDir, fileName)
    },
    tsdocMetadata: {
      enabled: false
    },
    messages: {
      compilerMessageReporting: {
        default: {
          logLevel: "none"
        }
      },
      extractorMessageReporting: {
        default: {
          logLevel: "none"
        }
      }
    }
  };
  if (configPath) {
    mergeObjects(configObject, ExtractorConfig.loadFile(configPath));
  }
  if (Object.keys(extractorConfig).length) {
    mergeObjects(configObject, extractorConfig);
  }
  const config = ExtractorConfig.prepare({
    configObject,
    configObjectFullPath,
    packageJsonFullPath: tryGetPkgPath(configObjectFullPath)
  });
  try {
    return Extractor.invoke(config, {
      localBuild: false,
      showVerboseMessages: false,
      showDiagnostics: false,
      typescriptCompilerFolder: libFolder,
      ...invokeOptions
    });
  } catch (error) {
    if (error?.message?.includes("Unable to follow symbol")) {
      const symbolMatch = error.message.match(/Unable to follow symbol for "([^"]+)"/);
      const symbol = symbolMatch ? symbolMatch[1] : "unknown";
      throw new Error(
        `[unplugin-dts] Failed to bundle declaration files due to an API Extractor limitation when analyzing the symbol "${symbol}".

This is usually caused by complex type references from external packages (such as Vue) that API Extractor cannot resolve.

You can try the following solutions:
1. Update \`@microsoft/api-extractor\` to the latest version.
2. Ensure the TypeScript version matches what \`@microsoft/api-extractor\` uses internally.
3. If the symbol is from an external package, try adding it to \`bundleTypes.bundledPackages\`.
   For Vue projects, you can try: \`bundledPackages: ['vue']\`.

Original error: ${error.message}`
      );
    }
    throw error;
  }
}
function createApiExtractorProvider({
  configPath,
  extractorConfig,
  bundledPackages,
  invokeOptions
}) {
  return {
    name: "api-extractor",
    async bundle(context) {
      const result = await bundleDtsFiles({
        root: context.root,
        configPath,
        tsconfigPath: context.tsconfigPath,
        compilerOptions: context.compilerOptions,
        outDir: context.outDir,
        entryPath: context.entryPath,
        outputPath: context.outputPath,
        fileName: context.fileName,
        libFolder: context.libFolder,
        extractorConfig,
        bundledPackages,
        invokeOptions
      });
      return {
        succeeded: result.succeeded,
        warningCount: result.warningCount,
        errorCount: result.errorCount,
        outputPath: context.outputPath,
        meta: result
      };
    }
  };
}

function normalizeProvider(provider) {
  return typeof provider === "function" ? { bundle: provider } : provider;
}

const jsonRE = /\.json$/;
function JsonResolver() {
  return {
    name: "json",
    supports(id) {
      return jsonRE.test(id);
    },
    transform({ id, root, program }) {
      const sourceFile = program.getSourceFile(id);
      if (!sourceFile) return [];
      return [
        {
          path: relative(root, `${id}.d.ts`),
          content: `declare const _default: ${sourceFile.text};

export default _default;
`
        }
      ];
    }
  };
}

const svelteRE = /\.svelte$/;
let lowerVersion;
function querySvelteVersion() {
  if (typeof lowerVersion === "boolean") return;
  try {
    const version = tryGetPackageInfo("svelte")?.version;
    lowerVersion = version ? compare(version, "4.0.0", "<") : false;
  } catch (e) {
    lowerVersion = false;
  }
}
function SvelteResolver() {
  return {
    name: "svelte",
    supports(id) {
      return svelteRE.test(id);
    },
    transform({ id, root }) {
      querySvelteVersion();
      return [
        {
          path: relative(root, `${id}.d.ts`),
          content: `export { ${lowerVersion ? "SvelteComponentTyped" : "SvelteComponent"} as default } from 'svelte';
`
        }
      ];
    }
  };
}

const vueRE = /\.vue$/;
function VueResolver() {
  return {
    name: "vue",
    supports(id) {
      return vueRE.test(id);
    },
    transform({ id, code, program }) {
      const sourceFile = program.getSourceFile(id) || program.getSourceFile(id + ".ts") || program.getSourceFile(id + ".js") || program.getSourceFile(id + ".tsx") || program.getSourceFile(id + ".jsx");
      if (!sourceFile) return { outputs: [] };
      const outputs = [];
      const { emitSkipped, diagnostics } = program.emit(
        sourceFile,
        (path, content) => {
          outputs.push({ path, content });
        },
        void 0,
        true
      );
      if (!program.getCompilerOptions().declarationMap) {
        return { outputs, emitSkipped, diagnostics };
      }
      const [beforeScript] = code.split(/\s*<script.*>/);
      const beforeLines = beforeScript.split("\n").length;
      for (const output of outputs) {
        if (output.path.endsWith(".map")) {
          try {
            const sourceMap = JSON.parse(output.content);
            sourceMap.sources = sourceMap.sources.map(
              (source) => source.replace(/\.vue\.ts$/, ".vue")
            );
            if (beforeScript && beforeScript !== code && beforeLines) {
              sourceMap.mappings = `${base64VLQEncode([0, 0, beforeLines, 0])};${sourceMap.mappings}`;
            }
            output.content = JSON.stringify(sourceMap);
          } catch (e) {
          }
        }
      }
      return { outputs, emitSkipped, diagnostics };
    }
  };
}

function parseResolvers(resolvers) {
  const nameMap = /* @__PURE__ */ new Map();
  for (const resolver of resolvers) {
    resolver.name && nameMap.set(resolver.name, resolver);
  }
  return Array.from(nameMap.values());
}

const globSuffixRE = /^((?:.*\.[^.]+)|(?:\*+))$/;
function normalizeGlob(path) {
  if (/[\\/]$/.test(path)) {
    return path + "**";
  } else if (!globSuffixRE.test(path.split(/[\\/]/).pop())) {
    return path + "/**";
  }
  return path;
}
function walkSourceFile(sourceFile, callback) {
  function walkNode(node, parent, callback2) {
    if (callback2(node, parent) !== false) {
      node.forEachChild((child) => walkNode(child, node, callback2));
    }
  }
  sourceFile.forEachChild((child) => walkNode(child, sourceFile, callback));
}
function isAliasMatch(alias, importer) {
  if (isRegExp(alias.find)) return alias.find.test(importer);
  if (importer.length < alias.find.length) return false;
  if (importer === alias.find) return true;
  return importer.indexOf(alias.find) === 0 && (alias.find.endsWith("/") || importer.substring(alias.find.length)[0] === "/");
}
function transformAlias(importer, dir, aliases, aliasesExclude) {
  if (aliases?.length && !aliasesExclude.some((e) => isRegExp(e) ? e.test(importer) : String(e) === importer)) {
    for (const alias of aliases) {
      if (!isAliasMatch(alias, importer)) continue;
      const replacement = isAbsolute(alias.replacement) ? normalizePath(relative(dir, alias.replacement)) : normalizePath(alias.replacement);
      const endsWithSlash = typeof alias.find === "string" ? alias.find.endsWith("/") : importer.match(alias.find)[0].endsWith("/");
      const truthPath = importer.replace(alias.find, replacement + (endsWithSlash ? "/" : ""));
      const absolutePath = resolve$1(dir, truthPath);
      const normalizedPath = normalizePath(relative(dir, absolutePath));
      const resultPath = normalizedPath.startsWith(".") ? normalizedPath : `./${normalizedPath}`;
      if (!isAliasGlobal(alias)) return resultPath;
      if (importResolves(absolutePath)) return resultPath;
    }
  }
  return importer;
}
const vlsRE = /^_?__VLS_/;
function isVLSNode(node) {
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations.some(
      (d) => ts.isIdentifier(d.name) && vlsRE.test(`${d.name.escapedText}`)
    );
  }
  if (ts.isTypeAliasDeclaration(node)) {
    return vlsRE.test(`${node.name.escapedText}`);
  }
  if (ts.isFunctionDeclaration(node)) {
    return !!node.name && vlsRE.test(`${node.name.escapedText}`);
  }
  return false;
}
function transformCode(options) {
  const s = new MagicString(options.content);
  const ast = ts.createSourceFile("a.ts", options.content, ts.ScriptTarget.Latest);
  const dir = dirname(options.filePath);
  const importMap = /* @__PURE__ */ new Map();
  const usedDefault = /* @__PURE__ */ new Map();
  const declareModules = [];
  const toLibName = (origin) => {
    const name = transformAlias(origin, dir, options.aliases, options.aliasesExclude);
    return options.cleanVueFileName ? name.replace(/\.vue$/, "") : name;
  };
  let indexCount = 0;
  let importCount = 0;
  const declaredVLS = /* @__PURE__ */ new Set();
  const shouldReplaceVLS = options.replaceUnresolvedVLS ?? false;
  if (shouldReplaceVLS) {
    walkSourceFile(ast, (node) => {
      if (ts.isTypeAliasDeclaration(node) && ts.isIdentifier(node.name) && vlsRE.test(`${node.name.escapedText}`)) {
        declaredVLS.add(`${node.name.escapedText}`);
      }
      if (ts.isInterfaceDeclaration(node) && vlsRE.test(`${node.name.escapedText}`)) {
        declaredVLS.add(`${node.name.escapedText}`);
      }
      if (ts.isFunctionDeclaration(node) && node.name && vlsRE.test(`${node.name.escapedText}`)) {
        declaredVLS.add(`${node.name.escapedText}`);
      }
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((d) => {
          if (ts.isIdentifier(d.name) && vlsRE.test(`${d.name.escapedText}`)) {
            declaredVLS.add(`${d.name.escapedText}`);
          }
        });
      }
    });
  }
  walkSourceFile(ast, (node, parent) => {
    if (ts.isImportDeclaration(node)) {
      if (!node.importClause) {
        options.clearPureImport && s.remove(node.pos, node.end);
        ++importCount;
      } else if (ts.isStringLiteral(node.moduleSpecifier) && (node.importClause.name || node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings))) {
        const libName = toLibName(node.moduleSpecifier.text);
        const importSet = importMap.get(libName) ?? importMap.set(libName, /* @__PURE__ */ new Set()).get(libName);
        if (node.importClause.name && !usedDefault.has(libName)) {
          const usedType = node.importClause.name.escapedText;
          usedDefault.set(libName, usedType);
          importSet.add(`default as ${usedType}`);
        }
        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          node.importClause.namedBindings.elements.forEach((element) => {
            if (element.propertyName) {
              importSet.add(`${element.propertyName.getText(ast)} as ${element.name.escapedText}`);
            } else {
              importSet.add(element.name.escapedText);
            }
          });
        }
        s.remove(node.pos, node.end);
        ++importCount;
      } else if (ts.isStringLiteral(node.moduleSpecifier) && node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
        const libName = toLibName(node.moduleSpecifier.text);
        if (libName !== node.moduleSpecifier.text) {
          s.update(node.moduleSpecifier.pos, node.moduleSpecifier.end, ` '${libName}'`);
        }
        ++importCount;
      }
      return false;
    }
    if (shouldReplaceVLS && ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && vlsRE.test(`${node.typeName.escapedText}`) && !declaredVLS.has(`${node.typeName.escapedText}`)) {
      s.update(node.getStart(ast), node.end, "{}");
      return false;
    }
    if (ts.isImportTypeNode(node) && node.qualifier && ts.isLiteralTypeNode(node.argument) && ts.isIdentifier(node.qualifier) && ts.isStringLiteral(node.argument.literal)) {
      const libName = toLibName(node.argument.literal.text);
      if (!options.staticImport) {
        s.update(node.argument.literal.pos, node.argument.literal.end, `'${libName}'`);
        return !!node.typeArguments;
      }
      const importSet = importMap.get(libName) ?? importMap.set(libName, /* @__PURE__ */ new Set()).get(libName);
      let usedType = node.qualifier.escapedText;
      if (usedType === "default") {
        usedType = usedDefault.get(libName) ?? usedDefault.set(libName, `__DTS_DEFAULT_${indexCount++}__`).get(libName);
        importSet.add(`default as ${usedType}`);
        s.update(node.qualifier.pos, node.qualifier.end, usedType);
      } else {
        importSet.add(usedType);
      }
      if (node.isTypeOf) {
        s.update(node.getStart(ast), node.argument.end + 2, "typeof ");
      } else if (ts.isImportTypeNode(parent) && parent.typeArguments && parent.typeArguments[0] === node) {
        s.remove(node.pos, node.argument.end + 2);
      } else {
        s.update(node.pos, node.argument.end + 2, " ");
      }
      return !!node.typeArguments;
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) {
      s.update(
        node.arguments[0].pos,
        node.arguments[0].end,
        `'${toLibName(node.arguments[0].text)}'`
      );
      return false;
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      s.update(
        node.moduleSpecifier.pos,
        node.moduleSpecifier.end,
        ` '${toLibName(node.moduleSpecifier.text)}'`
      );
      return false;
    }
    if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
      if (ts.isIdentifier(node.name) && node.name.escapedText === "global" && node.body.statements.some(isVLSNode)) {
        s.remove(node.pos, node.end);
      } else {
        let libName = "";
        if (ts.isStringLiteral(node.name)) {
          libName = toLibName(node.name.text);
          if (libName !== node.name.text) {
            s.update(node.name.pos, node.name.end, ` '${libName}'`);
          }
        }
        if ((!libName || !libName.startsWith(".")) && node.modifiers?.[0] && node.modifiers[0].kind === ts.SyntaxKind.DeclareKeyword && !node.body.statements.some(
          (s2) => ts.isExportAssignment(s2) || ts.isExportDeclaration(s2) || ts.isImportDeclaration(s2)
        )) {
          declareModules.push(s.slice(node.pos, node.end + 1));
        }
      }
      return false;
    }
  });
  let prependImports = "";
  importMap.forEach((importSet, libName) => {
    prependImports += `import { ${Array.from(importSet).join(", ")} } from '${libName}';
`;
  });
  s.trimStart("\n").prepend(prependImports);
  return {
    content: s.toString(),
    declareModules,
    diffLineCount: importMap.size && importCount < importMap.size ? importMap.size - importCount : null
  };
}
function hasNormalExport(content) {
  const ast = ts.createSourceFile("a.ts", content, ts.ScriptTarget.Latest);
  let has = false;
  walkSourceFile(ast, (node) => {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          if (element.name.getText(ast) !== "default") {
            has = true;
            break;
          }
        }
      } else {
        has = true;
      }
    } else if ("modifiers" in node && Array.isArray(node.modifiers) && node.modifiers.length > 1) {
      for (let i = 0, len = node.modifiers.length; i < len; ++i) {
        if (node.modifiers[i].kind === ts.SyntaxKind.ExportKeyword && node.modifiers[i + 1]?.kind !== ts.SyntaxKind.DefaultKeyword) {
          has = true;
          break;
        }
      }
    }
    return false;
  });
  return has;
}
function hasExportDefault(content) {
  const ast = ts.createSourceFile("a.ts", content, ts.ScriptTarget.Latest);
  let has = false;
  walkSourceFile(ast, (node) => {
    if (ts.isExportAssignment(node)) {
      has = true;
    } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) {
        if (element.name.getText(ast) === "default") {
          has = true;
          break;
        }
      }
    } else if ("modifiers" in node && Array.isArray(node.modifiers) && node.modifiers.length > 1) {
      for (let i = 0, len = node.modifiers.length; i < len; ++i) {
        if (node.modifiers[i].kind === ts.SyntaxKind.ExportKeyword && node.modifiers[i + 1]?.kind === ts.SyntaxKind.DefaultKeyword) {
          has = true;
          break;
        }
      }
    }
    return false;
  });
  return has;
}

const maxConcurrency = availableParallelism();
const fixedCompilerOptions = {
  noEmit: false,
  declaration: true,
  emitDeclarationOnly: true,
  checkJs: false,
  skipLibCheck: true,
  preserveSymlinks: false,
  noEmitOnError: void 0,
  target: ts.ScriptTarget.ESNext
};
function isCanonicalPathEqualOrInside(canonicalFileName, canonicalDirectory) {
  const directoryPrefix = canonicalDirectory.endsWith("/") ? canonicalDirectory : `${canonicalDirectory}/`;
  return canonicalFileName === canonicalDirectory || canonicalFileName.startsWith(directoryPrefix);
}
function isVersionedCompilerHost(host) {
  const candidate = host;
  return typeof candidate.invalidateSourceFile === "function" && typeof candidate.getSourceFileCacheStats === "function";
}
function getDiagnostics(program) {
  return [
    ...program.getDeclarationDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getSyntacticDiagnostics()
  ];
}
const runtimeInternals = /* @__PURE__ */ new WeakMap();
function getRuntimeInternals(runtime) {
  const internals = runtimeInternals.get(runtime);
  if (!internals) throw new Error("Runtime is not initialized");
  return internals;
}
function shouldMeasureProgramReuse() {
  return handleDebug.enabled;
}
function isEmptyDeclarationEntry(content) {
  if (!content?.trim()) return true;
  const sourceFile = ts.createSourceFile("entry.d.ts", content, ts.ScriptTarget.Latest);
  return sourceFile.statements.every((statement) => {
    if (ts.isEmptyStatement(statement)) return true;
    return ts.isExportDeclaration(statement) && !statement.moduleSpecifier && !!statement.exportClause && ts.isNamedExports(statement.exportClause) && statement.exportClause.elements.length === 0;
  });
}
function parseAliases(aliasOptions = [], aliasesExclude = []) {
  let aliases;
  if (isNativeObj(aliasOptions)) {
    aliases = Object.entries(aliasOptions).map(([key, value]) => {
      return { find: key, replacement: value };
    });
  } else {
    aliases = ensureArray(aliasOptions).map((alias) => ({ ...alias }));
  }
  if (aliasesExclude.length > 0) {
    aliases = aliases.filter(
      ({ find }) => !aliasesExclude.some(
        (aliasExclude) => aliasExclude && (isRegExp(find) ? find.toString() === aliasExclude.toString() : isRegExp(aliasExclude) ? find.match(aliasExclude)?.[0] : find === aliasExclude)
      )
    );
  }
  return aliases;
}
class Runtime {
  static async toInstance({ processor = "ts", ...options }) {
    const mod = await loadProgramProcessor(processor);
    const api = mod.default ?? mod;
    return new Runtime(options, api);
  }
  root;
  publicRoot;
  entryRoot;
  configPath;
  compilerOptions;
  rawCompilerOptions;
  host;
  program;
  rootNames;
  diagnostics;
  outDirs;
  entries;
  // protected include: string[]
  // protected exclude: string[]
  aliases;
  aliasesExclude;
  libName;
  indexName;
  logger;
  resolvers;
  rootFiles;
  outputFiles;
  transformedFiles;
  programSourceFilesByCanonicalName;
  watchDirectoryNames;
  watchTargets;
  filter;
  rebuildProgram;
  constructor(options, programProcessor) {
    const { createCompilerHost, createParsedCommandLine, createProgram } = programProcessor;
    const {
      root,
      tsconfigPath,
      aliasesExclude = [],
      pathsToAliases,
      entries = {},
      logger = console
    } = options;
    const resolvers = parseResolvers([
      JsonResolver(),
      VueResolver(),
      SvelteResolver(),
      ...options.resolvers || []
    ]);
    const aliases = parseAliases(options.aliases, aliasesExclude);
    const configPath = tsconfigPath ? ensureAbsolute(tsconfigPath, root) : ts.findConfigFile(root, ts.sys.fileExists);
    const content = configPath ? createParsedCommandLine(ts, ts.sys, configPath) : void 0;
    const compilerOptions = {
      ...content?.options || {},
      ...options.compilerOptions || {},
      ...fixedCompilerOptions,
      outDir: ".",
      declarationDir: "."
    };
    const rawCompilerOptions = content?.raw.compilerOptions || {};
    if (programProcessor.needsModuleResolutionFallback || content?.fileNames.find((name) => name.endsWith(".vue"))) {
      setModuleResolution(compilerOptions);
    }
    const defaultOutDir = ensureAbsolute(
      content?.raw.compilerOptions?.outDir ? resolveConfigDir(content.raw.compilerOptions.outDir, root) : "dist",
      root
    );
    const outDirs = normalizeOutDirs(options.outDirs, root, defaultOutDir);
    const { baseUrl, paths } = compilerOptions;
    const resolvedBaseUrl = baseUrl ?? (paths && configPath ? dirname(configPath) : root);
    if (pathsToAliases && resolvedBaseUrl && paths) {
      aliases.push(
        ...parseTsAliases(
          ensureAbsolute(
            resolveConfigDir(resolvedBaseUrl, root),
            configPath ? dirname(configPath) : root
          ),
          paths
        )
      );
    }
    const computeGlobs = (rootGlobs, tsGlobs, defaultGlob) => {
      if (rootGlobs?.length) {
        return ensureArray(rootGlobs).map((glob) => normalizeGlob(resolveConfigDir(glob, ".")));
      }
      const relativeRoot = configPath ? normalizePath(relative(root, dirname(configPath))) : ".";
      const relativeRootGlob = relativeRoot === "." ? "." : relativeRoot.replace(globSignRE, "\\$&");
      const resolveTsGlobToRoot = (glob) => {
        glob = normalizePath(glob);
        if (glob.startsWith("/") || /^[a-zA-Z]:\//.test(glob)) return glob;
        if (relativeRootGlob === ".") return glob;
        return `${relativeRootGlob}/${glob}`;
      };
      return ensureArray(tsGlobs?.length ? tsGlobs : defaultGlob).map(
        (glob) => normalizeGlob(resolveTsGlobToRoot(resolveConfigDir(glob, ".")))
      );
    };
    const include = computeGlobs(
      options.include,
      [...ensureArray(content?.raw.include ?? []), ...ensureArray(content?.raw.files ?? [])],
      "**/*"
    );
    const exclude = [
      ...computeGlobs(options.exclude, content?.raw.exclude, "node_modules/**"),
      ...outDirs.map((outDir) => normalizeGlob(outDir.dir))
    ];
    const filter = createFilter(include, exclude, { resolve: root });
    const rootNames = [
      ...new Set(
        Object.values(entries).map((entry) => ensureAbsolute(entry, root)).concat(content?.fileNames.filter(filter) || []).map(normalizePath)
      )
    ];
    const host = createCompilerHost && process.env.DTS_DISABLE_SOURCE_FILE_CACHE !== "1" ? createCompilerHost(compilerOptions) : ts.createCompilerHost(compilerOptions);
    const program = createProgram({
      host,
      rootNames,
      options: compilerOptions,
      projectReferences: content?.projectReferences
    });
    const libName = toCapitalCase(options.libName || "_default");
    const indexName = options.indexName || defaultIndex;
    const maybeEmitted = (sourceFile) => {
      return !(compilerOptions.noEmitForJsFiles && jsRE.test(sourceFile.fileName)) && !sourceFile.isDeclarationFile && !program.isSourceFileFromExternalLibrary(sourceFile);
    };
    const emittableSourceFiles = program.getSourceFiles().filter(maybeEmitted).map((sourceFile) => sourceFile.fileName);
    const sourcePublicPath = queryPublicPath(emittableSourceFiles);
    const useTs6ImplicitRootDir = !compilerOptions.rootDir && !(compilerOptions.composite && compilerOptions.configFilePath) && compare(ts.version, "6.0.0", ">=") && !!configPath;
    let publicRoot = compilerOptions.rootDir ? ensureAbsolute(resolveConfigDir(compilerOptions.rootDir, root), root) : compilerOptions.composite && compilerOptions.configFilePath ? dirname(compilerOptions.configFilePath) : useTs6ImplicitRootDir ? dirname(configPath) : sourcePublicPath || (configPath ? dirname(configPath) : root);
    publicRoot = normalizePath(publicRoot);
    let entryRoot = options.entryRoot || (useTs6ImplicitRootDir ? sourcePublicPath || publicRoot : publicRoot);
    entryRoot = ensureAbsolute(entryRoot, root);
    const diagnostics = getDiagnostics(program);
    if (diagnostics?.length) {
      logger.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
    }
    const rootFiles = /* @__PURE__ */ new Set();
    for (const file of rootNames) {
      rootFiles.add(file);
    }
    this.root = root;
    this.publicRoot = publicRoot;
    this.entryRoot = entryRoot;
    this.configPath = configPath;
    this.compilerOptions = compilerOptions;
    this.rawCompilerOptions = rawCompilerOptions;
    this.host = host;
    this.rootNames = rootNames;
    this.diagnostics = diagnostics;
    this.outDirs = outDirs;
    this.entries = entries;
    this.aliases = aliases;
    this.aliasesExclude = aliasesExclude;
    this.libName = libName;
    this.indexName = indexName;
    this.logger = logger;
    this.resolvers = resolvers;
    this.rootFiles = rootFiles;
    this.outputFiles = /* @__PURE__ */ new Map();
    this.transformedFiles = /* @__PURE__ */ new Set();
    this.filter = filter;
    this.program = program;
    const cacheStats = this.getSourceFileCacheStats();
    const measureInitialReuse = shouldMeasureProgramReuse();
    const lastProgramReuse = {
      mode: "fresh",
      reason: "initial",
      sourceFiles: measureInitialReuse ? program.getSourceFiles().length : 0,
      reusedSourceFiles: 0,
      nonDefaultSourceFiles: measureInitialReuse ? program.getSourceFiles().filter((sourceFile) => !program.isSourceFileDefaultLibrary(sourceFile)).length : 0,
      reusedNonDefaultSourceFiles: 0,
      cacheHits: cacheStats.hits,
      cacheMisses: cacheStats.misses,
      cacheInvalidations: cacheStats.invalidations,
      cacheEntries: cacheStats.entries
    };
    this.rebuildProgram = () => {
      const internals = getRuntimeInternals(this);
      const { createCompilerHost: createCompilerHost2, createProgram: createProgram2 } = internals.programProcessor;
      if (createCompilerHost2) {
        this.host = process.env.DTS_DISABLE_SOURCE_FILE_CACHE === "1" ? ts.createCompilerHost(this.compilerOptions) : createCompilerHost2(this.compilerOptions);
      }
      this.program = createProgram2({
        host: this.host,
        rootNames: this.rootNames,
        options: this.compilerOptions,
        projectReferences: internals.projectReferences
      });
      this.programSourceFilesByCanonicalName = void 0;
      this.watchDirectoryNames = void 0;
      this.watchTargets = void 0;
    };
    runtimeInternals.set(this, {
      runtimeOptions: options,
      programProcessor,
      projectReferences: content?.projectReferences,
      configWatchDirectories: Object.keys(content?.wildcardDirectories ?? {}).map(normalizePath),
      emittedFilePaths: /* @__PURE__ */ new Set(),
      cleanStaleOutputs: false,
      lastProgramReuse,
      rebuildProgramIncremental: (changes) => this.rebuildProgramIncremental(changes),
      isConfigFile: (fileName) => this.isConfigFile(fileName),
      shouldHandleWatchChange: (fileName) => this.shouldHandleWatchChange(fileName),
      getWatchTargets: () => this.getWatchTargets(),
      filterWatchDirectories: (directories, outputDirectories) => this.filterWatchDirectories(directories, outputDirectories),
      isWatchDirectory: (fileName) => this.isWatchDirectory(fileName)
    });
  }
  getSourceFileCacheStats() {
    return isVersionedCompilerHost(this.host) ? this.host.getSourceFileCacheStats() : { entries: 0, hits: 0, misses: 0, invalidations: 0 };
  }
  getCanonicalFileName(fileName) {
    return normalizePath(
      this.host.getCanonicalFileName(ensureAbsolute(fileName, this.host.getCurrentDirectory()))
    );
  }
  measureProgramReuse(previousProgram, mode, reason, previousCacheStats) {
    const currentCacheStats = this.getSourceFileCacheStats();
    const cacheStats = {
      cacheHits: currentCacheStats.hits - previousCacheStats.hits,
      cacheMisses: currentCacheStats.misses - previousCacheStats.misses,
      cacheInvalidations: currentCacheStats.invalidations - previousCacheStats.invalidations,
      cacheEntries: currentCacheStats.entries
    };
    if (!shouldMeasureProgramReuse()) {
      getRuntimeInternals(this).lastProgramReuse = {
        mode,
        reason,
        sourceFiles: 0,
        reusedSourceFiles: 0,
        nonDefaultSourceFiles: 0,
        reusedNonDefaultSourceFiles: 0,
        ...cacheStats
      };
      return;
    }
    const previousSourceFiles = new Map(
      previousProgram.getSourceFiles().map((sourceFile) => [this.getCanonicalFileName(sourceFile.fileName), sourceFile])
    );
    const sourceFiles = this.program.getSourceFiles();
    const reusedSourceFiles = sourceFiles.filter(
      (sourceFile) => previousSourceFiles.get(this.getCanonicalFileName(sourceFile.fileName)) === sourceFile
    );
    const nonDefaultSourceFiles = sourceFiles.filter(
      (sourceFile) => !this.program.isSourceFileDefaultLibrary(sourceFile)
    );
    const reused = new Set(reusedSourceFiles);
    getRuntimeInternals(this).lastProgramReuse = {
      mode,
      reason,
      sourceFiles: sourceFiles.length,
      reusedSourceFiles: reusedSourceFiles.length,
      nonDefaultSourceFiles: nonDefaultSourceFiles.length,
      reusedNonDefaultSourceFiles: nonDefaultSourceFiles.filter(
        (sourceFile) => reused.has(sourceFile)
      ).length,
      ...cacheStats
    };
    handleDebug("program rebuild %O", getRuntimeInternals(this).lastProgramReuse);
  }
  refreshDiagnostics() {
    this.diagnostics = getDiagnostics(this.program);
    if (this.diagnostics.length) {
      this.logger.error(ts.formatDiagnosticsWithColorAndContext(this.diagnostics, this.host));
    }
  }
  rebuildFresh(previousProgram, reason) {
    const internals = getRuntimeInternals(this);
    const previousHost = this.host;
    const previousLogger = this.logger;
    const preserveVueHost = !!internals.programProcessor.releaseSourceFile && reason !== "config";
    if (reason === "create" || reason === "delete" || reason === "config" || reason === "forced" || reason === "untracked-file" || reason === "missing-file") {
      internals.cleanStaleOutputs = true;
    }
    const rebuildProgram = this.rebuildProgram;
    const fresh = new Runtime(
      preserveVueHost ? {
        ...internals.runtimeOptions,
        logger: { info() {
        }, warn() {
        }, error() {
        } }
      } : internals.runtimeOptions,
      internals.programProcessor
    );
    const freshInternals = getRuntimeInternals(fresh);
    Object.assign(this, fresh);
    Object.defineProperty(this, "rebuildProgram", {
      value: rebuildProgram,
      configurable: true,
      enumerable: true,
      writable: true
    });
    internals.projectReferences = freshInternals.projectReferences;
    internals.configWatchDirectories = freshInternals.configWatchDirectories;
    if (preserveVueHost) {
      this.host = previousHost;
      this.logger = previousLogger;
      this.program = internals.programProcessor.createProgram({
        host: previousHost,
        rootNames: this.rootNames,
        options: this.compilerOptions,
        projectReferences: internals.projectReferences
      });
      this.programSourceFilesByCanonicalName = void 0;
      this.watchDirectoryNames = void 0;
      this.watchTargets = void 0;
      this.refreshDiagnostics();
    }
    this.releaseRemovedProgramSourceFiles(previousProgram);
    this.measureProgramReuse(previousProgram, "fresh", reason, {
      entries: 0,
      hits: 0,
      misses: 0,
      invalidations: 0
    });
  }
  releaseRemovedProgramSourceFiles(previousProgram) {
    const { releaseSourceFile } = getRuntimeInternals(this).programProcessor;
    if (!releaseSourceFile) return;
    const currentSourceFiles = new Set(
      this.program.getSourceFiles().map((sourceFile) => this.getCanonicalFileName(sourceFile.fileName))
    );
    for (const sourceFile of previousProgram.getSourceFiles()) {
      if (!currentSourceFiles.has(this.getCanonicalFileName(sourceFile.fileName))) {
        releaseSourceFile(previousProgram, sourceFile.fileName);
      }
    }
  }
  rebuildProgramWithCurrentHost(previousProgram, reason) {
    const internals = getRuntimeInternals(this);
    this.program = internals.programProcessor.createProgram({
      host: this.host,
      rootNames: this.rootNames,
      options: this.compilerOptions,
      projectReferences: internals.projectReferences
    });
    this.programSourceFilesByCanonicalName = void 0;
    this.watchDirectoryNames = void 0;
    this.watchTargets = void 0;
    this.refreshDiagnostics();
    this.releaseRemovedProgramSourceFiles(previousProgram);
    this.measureProgramReuse(previousProgram, "fresh", reason, {
      entries: 0,
      hits: 0,
      misses: 0,
      invalidations: 0
    });
  }
  rebuildProgramIncremental(changes) {
    const previousProgram = this.program;
    const host = this.host;
    const programSourceFiles = /* @__PURE__ */ new Map();
    let fallbackReason = "";
    for (const change of changes) {
      const fileName = change.fileName && normalizePath(change.fileName);
      const event = change.event ?? "update";
      const programSourceFile = fileName ? this.getProgramSourceFile(fileName) : void 0;
      if (change.forceFresh) fallbackReason = "forced";
      else if (!fileName) fallbackReason = "missing-file";
      else if (event !== "update") fallbackReason = event;
      else if (this.isConfigFile(fileName)) fallbackReason = "config";
      else if (this.matchResolver(fileName) || fileName.endsWith(".json")) {
        fallbackReason = "resolver";
      } else if (!programSourceFile) fallbackReason = "untracked-file";
      else {
        programSourceFiles.set(
          this.getCanonicalFileName(programSourceFile.fileName),
          programSourceFile
        );
      }
      if (fallbackReason) break;
    }
    if (!isVersionedCompilerHost(host)) {
      const reason = fallbackReason || "cache-disabled";
      if (!fallbackReason || fallbackReason === "resolver") {
        this.rebuildProgramWithCurrentHost(previousProgram, reason);
      } else {
        this.rebuildFresh(previousProgram, reason);
      }
      return this.getChangedProgramSourceFiles(changes);
    }
    if (fallbackReason) {
      this.rebuildFresh(previousProgram, fallbackReason);
      return this.getChangedProgramSourceFiles(changes);
    }
    const previousCacheStats = this.getSourceFileCacheStats();
    for (const sourceFile of programSourceFiles.values()) {
      host.invalidateSourceFile(sourceFile.fileName);
    }
    const internals = getRuntimeInternals(this);
    this.program = internals.programProcessor.createProgram({
      host,
      rootNames: this.rootNames,
      options: this.compilerOptions,
      projectReferences: internals.projectReferences,
      oldProgram: previousProgram
    });
    this.programSourceFilesByCanonicalName = void 0;
    this.watchDirectoryNames = void 0;
    this.watchTargets = void 0;
    this.refreshDiagnostics();
    this.measureProgramReuse(previousProgram, "incremental", "source-update", previousCacheStats);
    return this.getChangedProgramSourceFiles(changes);
  }
  getHost() {
    return this.host;
  }
  getProgram() {
    return this.program;
  }
  getProgramSourceFile(fileName) {
    if (!this.programSourceFilesByCanonicalName) {
      this.programSourceFilesByCanonicalName = new Map(
        this.program.getSourceFiles().map((sourceFile) => [this.getCanonicalFileName(sourceFile.fileName), sourceFile])
      );
    }
    return this.programSourceFilesByCanonicalName.get(this.getCanonicalFileName(fileName));
  }
  getChangedProgramSourceFiles(changes) {
    const sourceFiles = /* @__PURE__ */ new Set();
    for (const change of changes) {
      if (!change.fileName) continue;
      const sourceFile = this.getProgramSourceFile(change.fileName);
      if (sourceFile) sourceFiles.add(normalizePath(sourceFile.fileName));
    }
    return [...sourceFiles];
  }
  isConfigFile(fileName) {
    return !!this.configPath && this.getCanonicalFileName(fileName) === this.getCanonicalFileName(this.configPath);
  }
  shouldHandleWatchChange(fileName) {
    return this.filter(fileName) || this.isConfigFile(fileName) || !!this.matchResolver(fileName) || !!this.getProgramSourceFile(fileName);
  }
  getWatchTargets() {
    if (this.watchTargets) return this.watchTargets;
    const files = new Set(this.getRootFiles());
    const directories = /* @__PURE__ */ new Set();
    const contextDirectories = /* @__PURE__ */ new Set();
    for (const directory of getRuntimeInternals(this).configWatchDirectories) {
      directories.add(directory);
    }
    if (this.configPath) files.add(normalizePath(this.configPath));
    const { programProcessor } = getRuntimeInternals(this);
    for (const sourceFile of this.program.getSourceFiles()) {
      if (programProcessor.isInternalSourceFile?.(sourceFile)) continue;
      if (!this.program.isSourceFileDefaultLibrary(sourceFile)) {
        files.add(normalizePath(sourceFile.fileName));
        if (!this.program.isSourceFileFromExternalLibrary(sourceFile)) {
          directories.add(normalizePath(dirname(sourceFile.fileName)));
        }
      }
    }
    for (const directory of directories) {
      const isInsideOutDir = this.outDirs.some(
        (outDir) => this.isPathEqualOrInside(directory, outDir.dir)
      );
      const containsOutDir = this.outDirs.some(
        (outDir) => this.isPathEqualOrInside(outDir.dir, directory)
      );
      if (!isInsideOutDir) files.add(directory);
      if (!isInsideOutDir && !containsOutDir) contextDirectories.add(directory);
    }
    this.watchTargets = {
      files: [...files].filter((file) => !directories.has(file)),
      directories: [...files].filter((file) => directories.has(file)),
      contextDirectories: [...contextDirectories],
      outputDirectories: this.outDirs.map((outDir) => outDir.dir)
    };
    return this.watchTargets;
  }
  isPathEqualOrInside(fileName, directory) {
    const canonicalFileName = this.getCanonicalFileName(fileName);
    const canonicalDirectory = this.getCanonicalFileName(directory);
    return isCanonicalPathEqualOrInside(canonicalFileName, canonicalDirectory);
  }
  filterWatchDirectories(directories, outputDirectories) {
    return directories.filter(
      (directory) => outputDirectories.every(
        (outputDirectory) => !this.isPathEqualOrInside(directory, outputDirectory) && !this.isPathEqualOrInside(outputDirectory, directory)
      )
    );
  }
  isWatchDirectory(fileName) {
    if (!this.watchDirectoryNames) {
      this.watchDirectoryNames = new Set(
        this.getWatchTargets().directories.map((directory) => this.getCanonicalFileName(directory))
      );
    }
    return this.watchDirectoryNames.has(this.getCanonicalFileName(fileName));
  }
  matchResolver(id) {
    return this.resolvers.find((r) => r.supports(id));
  }
  getRootFiles() {
    return [...this.rootFiles];
  }
  restoreRootFiles() {
    for (const file of this.rootNames) {
      this.rootFiles.add(file);
    }
  }
  addRootFile(fileName) {
    this.rootFiles.add(normalizePath(fileName));
  }
  clearTransformedFiles() {
    this.transformedFiles.clear();
  }
  getDiagnostics() {
    return [...this.diagnostics];
  }
  async transform(id, code) {
    const { publicRoot, outDirs, resolvers, rootFiles, outputFiles, transformedFiles } = this;
    let resolver;
    id = normalizePath(id).split("?")[0];
    if (!this.filter(id) || !(resolver = resolvers.find((r) => r.supports(id))) && !tjsRE.test(id) || transformedFiles.has(id)) {
      return;
    }
    rootFiles.delete(id);
    transformedFiles.add(id);
    const outDir = outDirs[0].dir;
    if (resolver) {
      const result = await resolver.transform({
        id,
        code,
        root: publicRoot,
        outDir,
        host: this.host,
        program: this.program
      });
      let outputs;
      if (Array.isArray(result)) {
        outputs = result;
      } else {
        const { emitSkipped, diagnostics = [] } = result;
        if (emitSkipped && diagnostics.length > 0) {
          this.logger.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, this.host));
          this.diagnostics.push(...diagnostics);
        }
        outputs = result.outputs;
      }
      for (const { path, content } of outputs) {
        outputFiles.set(
          resolve(publicRoot, relative(outDir, ensureAbsolute(path, outDir))),
          content
        );
      }
    } else {
      const sourceFile = this.program.getSourceFile(id);
      if (sourceFile) {
        const { emitSkipped, diagnostics } = this.program.emit(
          sourceFile,
          (name, text) => {
            outputFiles.set(
              resolve(publicRoot, relative(outDir, ensureAbsolute(name, outDir))),
              text
            );
          },
          void 0,
          true
        );
        if (emitSkipped && diagnostics.length > 0) {
          this.logger.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, this.host));
          this.diagnostics.push(...diagnostics);
        }
      }
    }
    const dtsId = id.replace(tjsRE, "") + ".d.ts";
    const dtsSourceFile = this.program.getSourceFile(dtsId);
    dtsSourceFile && this.filter(dtsSourceFile.fileName) && outputFiles.set(normalizePath(dtsSourceFile.fileName), dtsSourceFile.getFullText());
  }
  async emitOutput(options = {}) {
    const {
      outDirs,
      logger,
      outputFiles,
      transformedFiles,
      rootFiles,
      root,
      publicRoot,
      entryRoot,
      aliases,
      aliasesExclude,
      entries,
      indexName,
      libName,
      configPath,
      rawCompilerOptions
    } = this;
    const {
      strictOutput = true,
      logPrefix = "[dts]",
      copyDtsFiles = false,
      cleanVueFileName = false,
      staticImport: staticImportOpt = false,
      clearPureImport = true,
      insertTypesEntry = false,
      bundleTypes = false,
      beforeWriteFile,
      afterRollup
    } = options;
    const staticImport = bundleTypes ? true : staticImportOpt;
    const {
      extractorConfig,
      bundledPackages,
      invokeOptions,
      configPath: bundleConfigPath
    } = isNativeObj(bundleTypes) ? bundleTypes : {};
    const cleanPath = (path, emittedFiles2) => {
      const cleanedPath = path.replace(".vue.d.ts", ".d.ts").replace(".vue.d.cts", ".d.cts").replace(".vue.d.mts", ".d.mts");
      return !emittedFiles2.has(cleanedPath) && cleanVueFileName ? cleanedPath : path;
    };
    const outDir = outDirs[0].dir;
    const primaryOutDirConfig = outDirs[0];
    const emittedFiles = /* @__PURE__ */ new Map();
    const currentEmittedFilePaths = /* @__PURE__ */ new Set();
    const declareModules = [];
    const writeOutput = async (path, content, outDir2, record = true, dtsExtension = ".d.ts") => {
      path = transformDtsPath(path, dtsExtension);
      if (!path.endsWith(".map")) {
        const mapExtension = dtsExtension === ".d.cts" ? ".d.cts.map" : dtsExtension === ".d.mts" ? ".d.mts.map" : ".d.ts.map";
        content = transformSourceMappingURL(content, mapExtension);
      }
      if (typeof beforeWriteFile === "function") {
        const result = await unwrapPromise(beforeWriteFile(path, content));
        if (result === false) return;
        if (result) {
          path = result.filePath || path;
          content = result.content ?? content;
        }
      }
      path = normalizePath(path);
      const dir = normalizePath(dirname(path));
      if (strictOutput && !dir.startsWith(normalizePath(outDir2))) {
        logger.warn(`${logPrefix} ${yellow("Outside emitted:")} ${path}`);
        return;
      }
      await mkdir(dir, { recursive: true });
      await writeFile(path, content, "utf-8");
      currentEmittedFilePaths.add(path);
      record && emittedFiles.set(path, content);
    };
    const { programProcessor } = getRuntimeInternals(this);
    const sourceFiles = this.program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      if (programProcessor.isInternalSourceFile?.(sourceFile)) continue;
      if (!this.filter(sourceFile.fileName)) continue;
      if ((copyDtsFiles || bundleTypes) && dtsRE$1.test(sourceFile.fileName)) {
        outputFiles.set(normalizePath(sourceFile.fileName), sourceFile.getFullText());
      }
      if (rootFiles.has(sourceFile.fileName)) {
        this.program.emit(
          sourceFile,
          (name, text) => {
            outputFiles.set(
              resolve(publicRoot, relative(outDir, ensureAbsolute(name, outDir))),
              text
            );
          },
          void 0,
          true
        );
        rootFiles.delete(sourceFile.fileName);
      }
    }
    handleDebug("emit output patch");
    const currentDir = this.host.getCurrentDirectory();
    const declarationFiles = /* @__PURE__ */ new Map();
    const mapFiles = /* @__PURE__ */ new Map();
    const prependMappings = /* @__PURE__ */ new Map();
    for (const [filePath, content] of outputFiles.entries()) {
      if (filePath.endsWith(".map")) {
        mapFiles.set(filePath, content);
      } else {
        declarationFiles.set(filePath, content);
      }
    }
    await runParallel(
      maxConcurrency,
      Array.from(declarationFiles.entries()),
      async ([filePath, content]) => {
        let relativePath = relative(
          entryRoot,
          cleanVueFileName ? cleanVueDtsFileName(filePath) : filePath
        );
        if (relativePath.startsWith("..")) {
          relativePath = relative(root, cleanVueFileName ? cleanVueDtsFileName(filePath) : filePath);
        }
        const newFilePath = resolve(outDir, relativePath);
        if (content) {
          const result = transformCode({
            filePath,
            content,
            aliases,
            aliasesExclude,
            staticImport,
            clearPureImport,
            cleanVueFileName,
            replaceUnresolvedVLS: !!bundleTypes
          });
          content = result.content;
          declareModules.push(...result.declareModules);
          if (result.diffLineCount) {
            const transformedPath = transformDtsPath(newFilePath, primaryOutDirConfig.dtsExtension);
            prependMappings.set(`${transformedPath}.map`, ";".repeat(result.diffLineCount));
          }
        }
        await writeOutput(newFilePath, content, outDir, true, primaryOutDirConfig.dtsExtension);
      }
    );
    await runParallel(
      maxConcurrency,
      Array.from(mapFiles.entries()),
      async ([filePath, content]) => {
        const baseDir = dirname(filePath);
        let relativePath = relative(
          entryRoot,
          cleanVueFileName ? cleanVueDtsFileName(filePath) : filePath
        );
        if (relativePath.startsWith("..")) {
          relativePath = relative(root, cleanVueFileName ? cleanVueDtsFileName(filePath) : filePath);
        }
        filePath = resolve(outDir, relativePath);
        try {
          const sourceMap = JSON.parse(content);
          sourceMap.sources = sourceMap.sources.map((source) => {
            return normalizePath(
              relative(
                dirname(filePath),
                resolve(currentDir, relative(publicRoot, baseDir), source)
              )
            );
          });
          const transformedFilePath = transformDtsPath(filePath, primaryOutDirConfig.dtsExtension);
          if (prependMappings.has(transformedFilePath)) {
            sourceMap.mappings = `${prependMappings.get(transformedFilePath)}${sourceMap.mappings}`;
          }
          content = JSON.stringify(sourceMap);
        } catch (e) {
          logger.warn(`${logPrefix} ${yellow("Processing source map fail:")} ${filePath}`);
        }
        await writeOutput(filePath, content, outDir, true, primaryOutDirConfig.dtsExtension);
      }
    );
    handleDebug("write output");
    if (insertTypesEntry || bundleTypes) {
      const pkgPath = tryGetPkgPath(root);
      let pkg = {};
      try {
        if (pkgPath) pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
      } catch (e) {
      }
      const primaryDtsExtension = primaryOutDirConfig.dtsExtension;
      const transformed = new Set(
        Array.from(transformedFiles).map((file) => {
          file = relative(entryRoot, file);
          return `${file.replace(tjsRE, "")}.d.${getJsExtPrefix(file)}ts`;
        })
      );
      const entryNames = Object.keys(entries);
      const types = findTypesPath(pkg.publishConfig, pkg);
      const multiple = entryNames.length > 1;
      const emptyEntryFiles = /* @__PURE__ */ new Set();
      let typesPath = cleanPath(
        types ? resolve(root, types) : resolve(outDir, indexName),
        emittedFiles
      );
      if (!multiple && !dtsRE$1.test(typesPath)) {
        logger.warn(
          `
${logPrefix} ${yellow("The resolved path of type entry is not ending with '.d.ts'.")}
`
        );
        typesPath = `${typesPath.replace(tjsRE, "")}.d.${getJsExtPrefix(typesPath)}ts`;
      }
      typesPath = transformDtsPath(typesPath, primaryDtsExtension);
      for (const name of entryNames) {
        const entryDtsPath = multiple ? cleanPath(
          resolve(outDir, tsToDtsWithExtension(name, primaryDtsExtension)),
          emittedFiles
        ) : typesPath;
        const sourceEntry = normalizePath(
          cleanPath(
            resolve(
              outDir,
              relative(entryRoot, tsToDtsWithExtension(entries[name], primaryDtsExtension))
            ),
            emittedFiles
          )
        );
        if (entryDtsPath === sourceEntry) {
          if (!isEmptyDeclarationEntry(emittedFiles.get(sourceEntry))) continue;
          const emptyEntryPath = normalizePath(cleanPath(entryDtsPath, emittedFiles));
          await writeOutput(emptyEntryPath, "export {}\n", outDir, true, primaryDtsExtension);
          if (emittedFiles.has(emptyEntryPath)) {
            emptyEntryFiles.add(emptyEntryPath);
          }
          continue;
        }
        if (transformed.has(relative(outDir, entryDtsPath)) && existsSync(entryDtsPath)) continue;
        let fromPath = normalizePath(relative(dirname(entryDtsPath), sourceEntry));
        fromPath = fromPath.replace(dtsRE$1, (_, prefix) => `.${prefix || ""}js`);
        fromPath = fullRelativeRE.test(fromPath) ? fromPath : `./${fromPath}`;
        let content = "export {}\n";
        const sourceContent = emittedFiles.get(sourceEntry);
        if (typeof sourceContent === "string") {
          if (hasNormalExport(sourceContent)) {
            content = `export * from '${fromPath}'
${content}`;
          }
          if (hasExportDefault(sourceContent)) {
            content += `import ${libName} from '${fromPath}'
export default ${libName}
${content}`;
          }
        }
        const syntheticEntryPath = normalizePath(cleanPath(entryDtsPath, emittedFiles));
        await writeOutput(syntheticEntryPath, content, outDir, true, primaryDtsExtension);
        if (isEmptyDeclarationEntry(sourceContent) && emittedFiles.has(syntheticEntryPath)) {
          emptyEntryFiles.add(syntheticEntryPath);
        }
      }
      handleDebug("insert index");
      if (bundleTypes) {
        logger.info(green(`${logPrefix} Start bundling declaration files...`));
        if (!getHasExtractor()) {
          logger.error(
            `
${logPrefix} ${red("Failed to load '@microsoft/api-extractor', have you installed it?")}
`
          );
          logger.warn(
            `
${logPrefix} ${yellow("Error occurred, skip bundle declaration files.")}
`
          );
        } else {
          const rollupFiles = /* @__PURE__ */ new Set();
          const compilerOptions = configPath ? getTsConfig(configPath, this.host.readFile).compilerOptions : rawCompilerOptions;
          const provider = normalizeProvider(
            createApiExtractorProvider({
              // api-extractor.json
              configPath: bundleConfigPath,
              extractorConfig,
              bundledPackages,
              invokeOptions
            })
          );
          const bundleEntry = async (path) => {
            path = normalizePath(path);
            if (emptyEntryFiles.has(path)) return;
            const result = await provider.bundle({
              root,
              // tsconfig.json
              tsconfigPath: configPath,
              compilerOptions,
              outDir,
              entryPath: path,
              outputPath: path,
              // fileName 已经包含正确的后缀（.d.ts / .d.cts / .d.mts）
              fileName: basename(path),
              libFolder: getTsLibFolder(),
              logger
            });
            emittedFiles.delete(path);
            rollupFiles.add(path);
            if (typeof afterRollup === "function") {
              await unwrapPromise(afterRollup(result.meta));
            }
          };
          if (multiple) {
            await runParallel(maxConcurrency, entryNames, async (name) => {
              await bundleEntry(
                cleanPath(
                  resolve(outDir, tsToDtsWithExtension(name, primaryDtsExtension)),
                  emittedFiles
                )
              );
            });
          } else {
            await bundleEntry(typesPath);
          }
          const emptyEntries = new Map(
            Array.from(emittedFiles).filter(([filePath]) => emptyEntryFiles.has(filePath))
          );
          const unbundledFiles = Array.from(emittedFiles.keys()).filter(
            (filePath) => !emptyEntryFiles.has(filePath)
          );
          await runParallel(maxConcurrency, unbundledFiles, (f) => unlink(f));
          for (const file of unbundledFiles) currentEmittedFilePaths.delete(file);
          removeDirIfEmpty(outDir);
          emittedFiles.clear();
          for (const [filePath, content] of emptyEntries) {
            emittedFiles.set(filePath, content);
          }
          const declared = declareModules.join("\n");
          await runParallel(maxConcurrency, [...rollupFiles], async (filePath) => {
            await writeOutput(
              filePath,
              await readFile(filePath, "utf-8") + (declared ? `
${declared}` : ""),
              dirname(filePath),
              true,
              primaryDtsExtension
            );
          });
          handleDebug("rollup output");
        }
      }
    }
    if (outDirs.length > 1) {
      const extraOutDirs = outDirs.slice(1);
      await runParallel(maxConcurrency, Array.from(emittedFiles), async ([wroteFile, content]) => {
        const relativePath = relative(outDir, wroteFile);
        await Promise.all(
          extraOutDirs.map(async (targetOutDirConfig) => {
            const targetOutDir = targetOutDirConfig.dir;
            let transformedRelativePath = relativePath;
            if (primaryOutDirConfig.dtsExtension !== targetOutDirConfig.dtsExtension) {
              if (relativePath.endsWith(primaryOutDirConfig.mapExtension)) {
                const basePath = relativePath.slice(0, -primaryOutDirConfig.mapExtension.length);
                transformedRelativePath = basePath + targetOutDirConfig.mapExtension;
              } else if (relativePath.endsWith(primaryOutDirConfig.dtsExtension)) {
                const basePath = relativePath.slice(0, -primaryOutDirConfig.dtsExtension.length);
                transformedRelativePath = basePath + targetOutDirConfig.dtsExtension;
              }
            }
            const path = resolve(targetOutDir, transformedRelativePath);
            if (wroteFile.endsWith(".map") || wroteFile.endsWith(primaryOutDirConfig.mapExtension)) {
              const editedContent = editSourceMapDir(content, outDir, targetOutDir);
              if (editedContent === false) {
                logger.warn(`${logPrefix} ${yellow("Processing source map fail:")} ${path}`);
              } else if (typeof editedContent === "string") {
                content = editedContent;
              }
            }
            await writeOutput(path, content, targetOutDir, false, targetOutDirConfig.dtsExtension);
          })
        );
      });
    }
    const internals = getRuntimeInternals(this);
    if (internals.cleanStaleOutputs) {
      const staleFiles = [...internals.emittedFilePaths].filter(
        (fileName) => !currentEmittedFilePaths.has(fileName)
      );
      await runParallel(maxConcurrency, staleFiles, async (fileName) => {
        try {
          await unlink(fileName);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      });
      internals.emittedFilePaths = currentEmittedFilePaths;
      internals.cleanStaleOutputs = false;
    } else {
      for (const fileName of currentEmittedFilePaths) {
        internals.emittedFilePaths.add(fileName);
      }
    }
    this.clearTransformedFiles();
    return emittedFiles;
  }
}
function rebuildRuntimeProgram(runtime, changes) {
  return getRuntimeInternals(runtime).rebuildProgramIncremental(
    Array.isArray(changes) ? changes : [changes]
  );
}
function isRuntimeConfigFile(runtime, fileName) {
  return getRuntimeInternals(runtime).isConfigFile(fileName);
}
function shouldHandleRuntimeWatchChange(runtime, fileName) {
  return getRuntimeInternals(runtime).shouldHandleWatchChange(fileName);
}
function getRuntimeWatchTargets(runtime, bundlerOutputDirectories = []) {
  const internals = getRuntimeInternals(runtime);
  const targets = internals.getWatchTargets();
  return {
    files: [...targets.files],
    directories: [...targets.directories],
    contextDirectories: internals.filterWatchDirectories(
      targets.contextDirectories,
      bundlerOutputDirectories
    ),
    outputDirectories: [...targets.outputDirectories]
  };
}
function isRuntimeWatchDirectory(runtime, fileName) {
  return getRuntimeInternals(runtime).isWatchDirectory(fileName);
}

const pluginName = "unplugin:dts";
const logPrefix = cyan(`[${pluginName}]`);
function nativeWatchGlobToSource(ignored) {
  if (!ignored.length) return void 0;
  const source = globToRegExp(ignored, { globstar: true, extended: true }).source;
  return source.slice(0, -1) + "(?:$|\\/)";
}
function nativeWatchIgnoredToPredicate(ignored) {
  if (Array.isArray(ignored)) {
    const sources = ignored.map(nativeWatchGlobToSource).filter(Boolean);
    if (!sources.length) return () => false;
    const regexp = new RegExp(sources.join("|"));
    return (fileName) => regexp.test(normalizePath(fileName));
  }
  if (typeof ignored === "string") {
    const source = nativeWatchGlobToSource(ignored);
    if (!source) return () => false;
    const regexp = new RegExp(source);
    return (fileName) => regexp.test(normalizePath(fileName));
  }
  if (ignored instanceof RegExp) {
    return (fileName) => ignored.test(normalizePath(fileName));
  }
  if (typeof ignored === "function") return ignored;
  return () => false;
}
function mergeNativeWatchIgnored(ignored, isAdditionalIgnored) {
  const isIgnored = nativeWatchIgnoredToPredicate(ignored);
  return (fileName) => isIgnored(fileName) || isAdditionalIgnored(fileName);
}
const pluginFactory = (options = {}, meta) => {
  const {
    processor: userProcessor,
    tsconfigPath,
    staticImport = false,
    clearPureImport = true,
    cleanVueFileName = false,
    insertTypesEntry = false,
    bundleTypes = false,
    pathsToAliases = true,
    aliasesExclude = [],
    copyDtsFiles = meta.framework !== "vite",
    declarationOnly = false,
    strictOutput = true,
    afterBootstrap,
    afterDiagnostic,
    beforeWriteFile,
    afterRollup,
    afterBuild,
    include,
    exclude,
    compilerOptions,
    resolvers,
    entryRoot
  } = options;
  let root = ensureAbsolute(options.root ?? "", process.cwd());
  let outDirs;
  let entries;
  let aliases;
  let libName = "_default";
  let indexName = defaultIndex;
  let logger = console;
  let isDev = false;
  let bundled = false;
  const buildTime = new BuildTimeTracker();
  let bundlerOutDirs = [];
  let nativeWatchIgnoredDirectories = [];
  const preparedWatchFileSystems = /* @__PURE__ */ new WeakSet();
  let entryPromise;
  let runtime;
  const pendingProgramChanges = /* @__PURE__ */ new Map();
  function queueProgramChange(change) {
    const fileName = change.fileName && normalizePath(change.fileName);
    const key = fileName ? ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase() : "__missing__";
    const previous = pendingProgramChanges.get(key);
    pendingProgramChanges.set(key, {
      fileName,
      event: change.event ?? previous?.event,
      forceFresh: change.forceFresh || previous?.forceFresh
    });
  }
  function isInsideWatchIgnoredDirectory(fileName) {
    fileName = ensureAbsolute(fileName, root);
    const canonicalFileName = ts.sys.useCaseSensitiveFileNames ? normalizePath(fileName) : normalizePath(fileName).toLowerCase();
    return nativeWatchIgnoredDirectories.some((directory) => {
      const canonicalDirectory = ts.sys.useCaseSensitiveFileNames ? normalizePath(directory) : normalizePath(directory).toLowerCase();
      return canonicalFileName === canonicalDirectory || canonicalFileName.startsWith(`${canonicalDirectory}/`);
    });
  }
  function isPathEqualOrInside(fileName, directory) {
    const canonicalFileName = ts.sys.useCaseSensitiveFileNames ? normalizePath(fileName) : normalizePath(fileName).toLowerCase();
    const canonicalDirectory = ts.sys.useCaseSensitiveFileNames ? normalizePath(directory) : normalizePath(directory).toLowerCase();
    return isCanonicalPathEqualOrInside(canonicalFileName, canonicalDirectory);
  }
  function getRealPath(fileName) {
    const unresolvedSegments = [];
    let existingPath = normalizePath(fileName);
    while (!ts.sys.fileExists(existingPath) && !ts.sys.directoryExists(existingPath)) {
      const parent = normalizePath(dirname(existingPath));
      if (parent === existingPath) return void 0;
      unresolvedSegments.unshift(basename(existingPath));
      existingPath = parent;
    }
    try {
      const realExistingPath = ts.sys.realpath?.(existingPath);
      if (!realExistingPath) return void 0;
      return unresolvedSegments.length ? resolve(realExistingPath, ...unresolvedSegments) : realExistingPath;
    } catch {
      return void 0;
    }
  }
  function getWatchPathAliases(directory) {
    const normalizedDirectory = normalizePath(directory);
    const aliases2 = /* @__PURE__ */ new Set([normalizedDirectory]);
    const realDirectory = getRealPath(normalizedDirectory);
    if (realDirectory) aliases2.add(normalizePath(realDirectory));
    if (isPathEqualOrInside(normalizedDirectory, root)) {
      const realRoot = getRealPath(root);
      if (realRoot) {
        const relativeDirectory = normalizePath(relative(root, normalizedDirectory));
        if (!isAbsolute(relativeDirectory) && !relativeDirectory.startsWith("../")) {
          aliases2.add(normalizePath(resolve(realRoot, relativeDirectory)));
        }
      }
    }
    return [...aliases2];
  }
  function isAnyPathEqualOrInside(fileNames, directories) {
    return fileNames.some(
      (fileName) => directories.some((directory) => isPathEqualOrInside(fileName, directory))
    );
  }
  function isInsideNativeWatchIgnoredDirectory(fileName) {
    return nativeWatchIgnoredDirectories.some((directory) => isPathEqualOrInside(fileName, directory));
  }
  function prepareNativeWatchFileSystem(compiler) {
    compiler.hooks.afterEnvironment.tap(pluginName, () => {
      const watchFileSystem = compiler.watchFileSystem;
      if (!watchFileSystem || preparedWatchFileSystems.has(watchFileSystem)) return;
      preparedWatchFileSystems.add(watchFileSystem);
      const watch = watchFileSystem.watch.bind(watchFileSystem);
      watchFileSystem.watch = (...parameters) => {
        const watchOptions = parameters[4];
        parameters[4] = {
          ...watchOptions,
          ignored: nativeWatchIgnoredDirectories.length ? mergeNativeWatchIgnored(watchOptions.ignored, isInsideNativeWatchIgnoredDirectory) : watchOptions.ignored
        };
        return watch(...parameters);
      };
    });
  }
  function captureRollupOutputDirectories(options2) {
    const outputs = ensureArray(
      options2.output
    ).filter((output) => !!output);
    bundlerOutDirs = outputs.flatMap((output) => {
      if (output.dir) return [ensureAbsolute(output.dir, process.cwd())];
      if (output.file) return [ensureAbsolute(dirname(output.file), process.cwd())];
      return [];
    });
  }
  function addRuntimeWatchTargets(context) {
    if (meta.framework === "esbuild") return;
    const targets = getRuntimeWatchTargets(runtime, bundlerOutDirs);
    const outputDirectories = [
      ...new Set([...targets.outputDirectories, ...bundlerOutDirs].map(normalizePath))
    ];
    const fileAliases = targets.files.map(getWatchPathAliases);
    const outputTargets = outputDirectories.map((directory) => {
      const aliases2 = getWatchPathAliases(directory);
      return {
        directory,
        aliases: aliases2,
        canIgnore: fileAliases.every(
          (sourceAliases) => !isAnyPathEqualOrInside(sourceAliases, aliases2)
        )
      };
    });
    const ignoredOutputDirectories = outputTargets.filter((target) => target.canIgnore);
    nativeWatchIgnoredDirectories = [
      ...new Set(ignoredOutputDirectories.flatMap((target) => target.aliases))
    ];
    for (const file of targets.files) {
      context.addWatchFile(file);
    }
    function canWatchDirectory(directory, canIgnoreNestedOutputs) {
      const directoryAliases = getWatchPathAliases(directory);
      return outputTargets.every((outputTarget) => {
        if (isAnyPathEqualOrInside(directoryAliases, outputTarget.aliases)) return false;
        if (!isAnyPathEqualOrInside(outputTarget.aliases, directoryAliases)) return true;
        return canIgnoreNestedOutputs && outputTarget.canIgnore;
      });
    }
    const nativeContext = context.getNativeBuildContext?.();
    if (nativeContext?.framework === "webpack" || nativeContext?.framework === "rspack") {
      const compilation = nativeContext.compilation;
      if (compilation) {
        const contextDirectories = targets.directories.filter(
          (directory) => canWatchDirectory(directory, true)
        );
        for (const directory of contextDirectories) {
          compilation.contextDependencies.add(directory);
        }
      }
      return;
    }
    const directories = meta.framework === "rollup" || meta.framework === "rolldown" ? targets.contextDirectories.filter((directory) => canWatchDirectory(directory, false)) : targets.directories.filter((directory) => canWatchDirectory(directory, true));
    for (const directory of directories) {
      context.addWatchFile(directory);
    }
  }
  function flushPendingProgramChanges() {
    if (!pendingProgramChanges.size) return;
    const changedSourceFiles = rebuildRuntimeProgram(runtime, [...pendingProgramChanges.values()]);
    for (const sourceFile of changedSourceFiles) {
      runtime.addRootFile(sourceFile);
    }
    pendingProgramChanges.clear();
  }
  function hasVueFilesInDir(dir) {
    try {
      const entries2 = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries2) {
        if (entry.isFile() && entry.name.endsWith(".vue")) {
          return true;
        }
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          const subEntries = readdirSync(`${dir}/${entry.name}`, { withFileTypes: true });
          if (subEntries.some((f) => f.isFile() && f.name.endsWith(".vue"))) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }
  function prepareFromCompiler(compiler) {
    root = ensureAbsolute(options.root ?? "", compiler.context);
    isDev = compiler.options.mode === "development";
    logger = compiler.getInfrastructureLogger(pluginName);
    entryPromise = (async () => {
      if (typeof compiler.options.entry === "function") {
        return await compiler.options.entry();
      }
      return compiler.options.entry;
    })().then((entry) => {
      entries = Object.keys(entry).reduce(
        (prev, current) => {
          const imports = entry[current].import;
          if (imports) {
            prev[current] = imports[0];
          }
          return prev;
        },
        {}
      );
    });
    const aliasOptions = compiler.options.resolve.alias ?? [];
    if (Array.isArray(aliasOptions)) {
      aliases = ensureArray(aliasOptions).filter((alias) => alias.alias && alias.alias.length > 0).map((alias) => ({
        find: alias.name,
        replacement: Array.isArray(alias.alias) ? alias.alias[0] : alias.alias
      }));
    } else {
      aliases = Object.entries(aliasOptions).filter(([, value]) => value && value.length > 0).map(([key, value]) => {
        return { find: key, replacement: Array.isArray(value) ? value[0] : value };
      });
    }
    if (compiler.options.output.library) {
      const library = compiler.options.output.library;
      let fileName;
      if (typeof library.name === "string") {
        fileName = library.name;
      } else if (Array.isArray(library.name)) {
        fileName = library.name[0];
      } else if (library.name?.root) {
        fileName = ensureArray(library.name.root)[0];
      }
      indexName = `${fileName || "index"}.d.ts`;
    }
    if (!options.outDirs && compiler.options.output.path) {
      outDirs = [ensureAbsolute(compiler.options.output.path, root)];
    }
    bundlerOutDirs = compiler.options.output.path ? [ensureAbsolute(compiler.options.output.path, root)] : [];
    handleDebug("parse webpack(rspack) config");
  }
  const rollupHooks = {
    options(options2) {
      captureRollupOutputDirectories(options2);
      const input = typeof options2.input === "string" ? [options2.input] : options2.input;
      if (Array.isArray(input)) {
        entries = input.reduce(
          (prev, current) => {
            prev[basename(current)] = current;
            return prev;
          },
          {}
        );
      } else {
        entries = { ...input };
      }
      logger = {
        info: this.info,
        warn: this.warn,
        error: this.error
      };
      handleDebug("parse rollup(rolldown) options");
    },
    generateBundle(_, bundle) {
      if (declarationOnly) {
        for (const id of Object.keys(bundle)) {
          delete bundle[id];
        }
      }
    }
  };
  return {
    name: "unplugin-dts",
    enforce: "pre",
    async buildStart() {
      if (isDev) return;
      if (runtime) {
        const interval2 = buildTime.begin("buildStart");
        try {
          flushPendingProgramChanges();
          addRuntimeWatchTargets(this);
        } finally {
          buildTime.end(interval2);
        }
        return;
      }
      handleDebug("begin buildStart");
      buildTime.reset();
      const interval = buildTime.begin("buildStart");
      if (entryPromise) {
        await entryPromise;
      }
      aliases = aliases || [];
      if (aliasesExclude.length > 0) {
        aliases = aliases.filter(
          ({ find }) => !aliasesExclude.some(
            (aliasExclude) => aliasExclude && (isRegExp(find) ? find.toString() === aliasExclude.toString() : isRegExp(aliasExclude) ? find.match(aliasExclude)?.[0] : find === aliasExclude)
          )
        );
      }
      for (const alias of aliases) {
        alias.replacement = resolve(alias.replacement);
      }
      let processor = userProcessor;
      let hasVueFiles = userProcessor === "vue";
      if (!hasVueFiles) {
        const hasVueEntries = entries && Object.values(entries).some((e) => e.endsWith(".vue"));
        let hasVueInTsconfig = false;
        let hasVueInInclude = false;
        if (!hasVueEntries) {
          const includeGlobs = ensureArray(include);
          hasVueInInclude = includeGlobs.some((g) => g?.includes(".vue"));
          if (!hasVueInInclude) {
            const configPath = tsconfigPath ? ensureAbsolute(tsconfigPath, root) : ts.findConfigFile(root, ts.sys.fileExists);
            if (configPath) {
              const config = ts.readJsonConfigFile(configPath, ts.sys.readFile);
              const raw = ts.parseJsonSourceFileConfigFileContent(
                config,
                ts.sys,
                dirname(configPath),
                {},
                configPath
              ).raw;
              const tsIncludes = [
                ...ensureArray(raw?.include ?? []),
                ...ensureArray(raw?.files ?? [])
              ];
              hasVueInTsconfig = tsIncludes.some((g) => g.includes(".vue"));
            }
          }
        }
        hasVueFiles = hasVueEntries || hasVueInInclude || hasVueInTsconfig || hasVueFilesInDir(root);
      }
      if (!processor && hasVueFiles) {
        processor = "vue";
      }
      runtime = await Runtime.toInstance({
        processor,
        root,
        outDirs: options.outDirs ?? outDirs,
        entryRoot,
        tsconfigPath,
        compilerOptions,
        pathsToAliases,
        include,
        exclude,
        resolvers,
        entries,
        aliases: options.aliases ?? aliases,
        aliasesExclude,
        libName,
        indexName,
        logger
      });
      if (userProcessor === "ts" && hasVueFiles) {
        logger.warn(
          `
${logPrefix} ${yellow(
            'Detected .vue files but processor is set to "ts". Vue declaration files may not be generated correctly. Consider using processor: "vue".'
          )}
`
        );
      }
      addRuntimeWatchTargets(this);
      if (typeof afterBootstrap === "function") {
        await unwrapPromise(afterBootstrap(runtime));
      }
      handleDebug("create ts program");
      buildTime.end(interval);
    },
    async transform(code, id) {
      id = normalizePath(id).split("?")[0];
      if (isDev || !runtime) return;
      if (!runtime.matchResolver(id) && !tjsRE.test(id)) return;
      await buildTime.track("transform", () => runtime.transform(id, code));
    },
    watchChange(id, change) {
      id = normalizePath(id).split("?")[0];
      const isWatchDirectory = runtime && isRuntimeWatchDirectory(runtime, id);
      if (isDev || !runtime || !isWatchDirectory && !shouldHandleRuntimeWatchChange(runtime, id)) {
        return;
      }
      if (bundled) buildTime.reset();
      const interval = buildTime.begin("watchChange");
      if (!isWatchDirectory && !isRuntimeConfigFile(runtime, id) && !runtime.matchResolver(id) && !tjsRE.test(id)) {
        runtime.restoreRootFiles();
        bundled = false;
        buildTime.end(interval);
        return;
      }
      runtime.restoreRootFiles();
      bundled = false;
      queueProgramChange({
        fileName: id,
        event: change?.event,
        forceFresh: isWatchDirectory
      });
      buildTime.end(interval);
    },
    async writeBundle() {
      if (isDev || !runtime || bundled) {
        runtime?.clearTransformedFiles();
        handleDebug("skip writeBundle");
        return;
      }
      bundled = true;
      handleDebug("begin writeBundle");
      logger.info(green(`
${logPrefix} Start generate declaration files...`));
      const interval = buildTime.begin("writeBundle");
      if (typeof afterDiagnostic === "function") {
        await unwrapPromise(afterDiagnostic(runtime.getDiagnostics()));
      }
      const emittedFiles = await runtime.emitOutput({
        strictOutput,
        copyDtsFiles,
        cleanVueFileName,
        staticImport,
        clearPureImport,
        insertTypesEntry,
        bundleTypes,
        logPrefix,
        beforeWriteFile,
        afterRollup
      });
      if (typeof afterBuild === "function") {
        await unwrapPromise(afterBuild(emittedFiles));
      }
      handleDebug("finish");
      buildTime.end(interval);
      const timing = buildTime.summarize();
      handleDebug("timing summary %O", timing);
      logger.info(
        green(`${logPrefix} Declaration files built in ${Math.round(timing.attributedMs)}ms.
`)
      );
    },
    vite: {
      apply: "build",
      config(config) {
        const aliasOptions = config?.resolve?.alias ?? [];
        const watchOptions = config.build?.watch;
        if (watchOptions) {
          const chokidarOptions = watchOptions.chokidar ?? {};
          config.build.watch = {
            ...watchOptions,
            chokidar: {
              ...chokidarOptions,
              ignored: [
                ...ensureArray(chokidarOptions.ignored),
                (fileName) => isInsideWatchIgnoredDirectory(fileName)
              ]
            }
          };
        }
        if (isNativeObj(aliasOptions)) {
          aliases = Object.entries(aliasOptions).map(([key, value]) => {
            return { find: key, replacement: value };
          });
        } else {
          aliases = ensureArray(aliasOptions).map((alias) => ({ ...alias }));
        }
      },
      async configResolved(config) {
        logger = config.logger;
        root = ensureAbsolute(options.root ?? "", config.root);
        bundlerOutDirs = [ensureAbsolute(config.build.outDir, root)];
        if (config.build.lib) {
          const input = typeof config.build.lib.entry === "string" ? [config.build.lib.entry] : config.build.lib.entry;
          if (Array.isArray(input)) {
            entries = input.reduce(
              (prev, current) => {
                prev[basename(current)] = current;
                return prev;
              },
              {}
            );
          } else {
            entries = { ...input };
          }
          const filename = config.build.lib.fileName ?? defaultIndex;
          const entry = typeof config.build.lib.entry === "string" ? config.build.lib.entry : Object.keys(config.build.lib.entry)[0];
          libName = config.build.lib.name || "_default";
          indexName = typeof filename === "string" ? filename : filename("es", entry);
          if (!dtsRE$1.test(indexName)) {
            indexName = `${indexName.replace(tjsRE, "")}.d.${getJsExtPrefix(indexName)}ts`;
          }
        } else {
          logger.warn(
            `
${logPrefix} ${yellow(
              "You are building a library that may not need to generate declaration files."
            )}
`
          );
          libName = "_default";
          indexName = defaultIndex;
        }
        if (!options.outDirs) {
          outDirs = [ensureAbsolute(config.build.outDir, root)];
        }
        handleDebug("parse vite config");
      },
      generateBundle(_, bundle) {
        if (declarationOnly) {
          for (const id of Object.keys(bundle)) {
            delete bundle[id];
          }
        }
      }
    },
    rollup: rollupHooks,
    rolldown: {
      ...rollupHooks
    },
    webpack(compiler) {
      prepareFromCompiler(compiler);
      prepareNativeWatchFileSystem(compiler);
      compiler.hooks.emit.tap("UnpluginDtsRemoveAssets", (compilation) => {
        if (declarationOnly) {
          compilation.assets = {};
        }
      });
    },
    rspack(compiler) {
      prepareFromCompiler(compiler);
      prepareNativeWatchFileSystem(compiler);
      compiler.hooks.thisCompilation.tap("UnpluginDtsRemoveAssets", (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: "UnpluginDtsRemoveAssets",
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
          },
          (assets) => {
            if (declarationOnly) {
              for (const filename of Object.keys(assets)) {
                delete assets[filename];
              }
            }
          }
        );
      });
    },
    esbuild: {
      setup(build) {
        const { entryPoints, outdir, absWorkingDir = process.cwd() } = build.initialOptions;
        root = ensureAbsolute(options.root ?? "", absWorkingDir);
        if (Array.isArray(entryPoints)) {
          entries = entryPoints.reduce(
            (prev, current) => {
              if (typeof current === "string") {
                prev[basename(current)] = current;
              } else {
                prev[basename(current.in)] = current.out;
              }
              return prev;
            },
            {}
          );
        } else {
          entries = { ...entryPoints };
        }
        if (!options.outDirs && outdir) {
          outDirs = [ensureAbsolute(outdir, root)];
        }
        handleDebug("parse esbuild options");
      }
    }
  };
};

export { ensureAbsolute as a, editSourceMapDir as e, normalizePath as n, pluginFactory as p, resolve as r, slash as s, ts as t };
