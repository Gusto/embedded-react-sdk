'use strict';

const node_path = require('node:path');
const plugin = require('../shared/unplugin-dts.D13_aqpS.cjs');
require('node:fs');
require('node:module');
require('glob-to-regexp');
require('kolorist');
require('node:perf_hooks');
require('node:fs/promises');
require('node:os');
require('@rollup/pluginutils');
require('compare-versions');
require('debug');
require('local-pkg');
require('magic-string');

function getScriptKind(fileName) {
  if (/\.tsx$/i.test(fileName)) return plugin.ts.ScriptKind.TSX;
  if (/\.[cm]?jsx?$/i.test(fileName)) return plugin.ts.ScriptKind.JS;
  if (/\.json$/i.test(fileName)) return plugin.ts.ScriptKind.JSON;
  return plugin.ts.ScriptKind.TS;
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
  const host = plugin.ts.createCompilerHost(options);
  const cache = /* @__PURE__ */ new Map();
  const versions = /* @__PURE__ */ new Map();
  const stats = { entries: 0, hits: 0, misses: 0, invalidations: 0 };
  const getCanonicalPath = (fileName) => {
    const absolute = plugin.ensureAbsolute(fileName, host.getCurrentDirectory());
    return plugin.normalizePath(host.getCanonicalFileName(absolute));
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
  const config = plugin.ts.readJsonConfigFile(configPath, host.readFile);
  return plugin.ts.parseJsonSourceFileConfigFileContent(config, host, node_path.dirname(configPath), {}, configPath);
}
const createProgram = plugin.ts.createProgram;

exports.createCompilerHost = createCompilerHost;
exports.createParsedCommandLine = createParsedCommandLine;
exports.createProgram = createProgram;
