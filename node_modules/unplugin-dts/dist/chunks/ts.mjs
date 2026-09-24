
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
import { dirname } from 'node:path';
import { t as ts, a as ensureAbsolute, n as normalizePath } from '../shared/unplugin-dts.Cl9Yl0J7.mjs';
import 'node:fs';
import 'node:module';
import 'glob-to-regexp';
import 'kolorist';
import 'node:perf_hooks';
import 'node:fs/promises';
import 'node:os';
import '@rollup/pluginutils';
import 'compare-versions';
import 'debug';
import 'local-pkg';
import 'magic-string';

function getScriptKind(fileName) {
  if (/\.tsx$/i.test(fileName)) return ts.ScriptKind.TSX;
  if (/\.[cm]?jsx?$/i.test(fileName)) return ts.ScriptKind.JS;
  if (/\.json$/i.test(fileName)) return ts.ScriptKind.JSON;
  return ts.ScriptKind.TS;
}
function getLanguageKey(value) {
  if (typeof value === "number") return `target:${value}`;
  return [
    "options",
    value.languageVersion,
    value.impliedNodeFormat ?? "",
    value.jsDocParsingMode ?? "",
    value.setExternalModuleIndicator ? "external" : "default"
  ].join("|");
}
function createCompilerHost(options) {
  const host = ts.createCompilerHost(options);
  const cache = /* @__PURE__ */ new Map();
  const versions = /* @__PURE__ */ new Map();
  const stats = { entries: 0, hits: 0, misses: 0, invalidations: 0 };
  const getCanonicalPath = (fileName) => {
    const absolute = ensureAbsolute(fileName, host.getCurrentDirectory());
    return normalizePath(host.getCanonicalFileName(absolute));
  };
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
    const path = getCanonicalPath(fileName);
    const version = versions.get(path) ?? 0;
    const languageKey = getLanguageKey(languageVersionOrOptions);
    const scriptKind = getScriptKind(fileName);
    const cached = cache.get(path);
    if (!shouldCreateNewSourceFile && cached?.version === version && cached.languageKey === languageKey && cached.scriptKind === scriptKind) {
      stats.hits++;
      return cached.sourceFile;
    }
    stats.misses++;
    const sourceFile = getSourceFile(
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile
    );
    if (sourceFile) {
      cache.set(path, {
        version,
        content: sourceFile.text,
        languageKey,
        scriptKind,
        sourceFile
      });
      stats.entries = cache.size;
    } else {
      cache.delete(path);
      stats.entries = cache.size;
    }
    return sourceFile;
  };
  return Object.assign(host, {
    invalidateSourceFile(fileName) {
      const path = getCanonicalPath(fileName);
      versions.set(path, (versions.get(path) ?? 0) + 1);
      cache.delete(path);
      stats.entries = cache.size;
      stats.invalidations++;
    },
    getSourceFileCacheStats() {
      return { ...stats };
    }
  });
}
function createParsedCommandLine(_ts, host, configPath) {
  const config = ts.readJsonConfigFile(configPath, host.readFile);
  return ts.parseJsonSourceFileConfigFileContent(config, host, dirname(configPath), {}, configPath);
}
const createProgram = ts.createProgram;

export { createCompilerHost, createParsedCommandLine, createProgram };
