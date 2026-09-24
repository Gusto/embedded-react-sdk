'use strict';

const node_path = require('node:path');
const languageCore = require('@vue/language-core');
const typescript = require('@volar/typescript');
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

const internalSourceFiles = /* @__PURE__ */ new WeakSet();
const programSourceFileReleasers = /* @__PURE__ */ new WeakMap();
const programLanguages = /* @__PURE__ */ new WeakMap();
let activeLanguage;
const needsModuleResolutionFallback = true;
function groupVueRootNames(vueRootNames, projectDirectory, pathApi = { parse: node_path.parse, relative: node_path.relative, resolve: plugin.resolve }) {
  projectDirectory = pathApi.resolve(projectDirectory);
  const projectVolume = pathApi.parse(projectDirectory).root;
  const groups = /* @__PURE__ */ new Map();
  for (const rootName of vueRootNames) {
    const fileName = pathApi.resolve(projectDirectory, rootName);
    const fileVolume = pathApi.parse(fileName).root;
    const directory = pathApi.relative(projectVolume, fileVolume) ? fileVolume : projectDirectory;
    const files = groups.get(directory) ?? [];
    files.push(fileName);
    groups.set(directory, files);
  }
  return [...groups].map(([directory, rootNames]) => ({ directory, rootNames }));
}
function createParsedCommandLine(_ts, host, configPath) {
  const vueResult = languageCore.createParsedCommandLine(_ts, host, plugin.slash(configPath));
  const config = _ts.readJsonConfigFile(configPath, host.readFile);
  const vueHost = {
    ...host,
    readDirectory(rootDir, extensions, excludes, includes, depth) {
      const extendedExtensions = extensions ? [...extensions, ".vue"] : extensions;
      return host.readDirectory(rootDir, extendedExtensions, excludes, includes, depth);
    }
  };
  const parsed = _ts.parseJsonSourceFileConfigFileContent(
    config,
    vueHost,
    node_path.dirname(configPath),
    {},
    configPath
  );
  return {
    ...parsed,
    vueOptions: vueResult.vueOptions
  };
}
function prepareVueProgramOptions(options) {
  const originalHost = options.host;
  if (!originalHost) return { options };
  const vueRootNames = options.rootNames.filter((fileName) => fileName.endsWith(".vue"));
  const projectDirectory = typeof options.options.configFilePath === "string" ? node_path.dirname(options.options.configFilePath) : originalHost.getCurrentDirectory();
  const syntheticRoots = /* @__PURE__ */ new Map();
  for (const group of groupVueRootNames(vueRootNames, projectDirectory)) {
    let sequence = 0;
    let syntheticFileName = plugin.resolve(group.directory, "__unplugin_dts_vue_root__.d.ts");
    while (originalHost.fileExists(syntheticFileName)) {
      syntheticFileName = plugin.resolve(group.directory, `__unplugin_dts_vue_root_${++sequence}__.d.ts`);
    }
    const text = group.rootNames.map((fileName) => {
      const path = plugin.slash(node_path.relative(group.directory, fileName));
      const moduleName = path.startsWith(".") ? path : `./${path}`;
      return `import ${JSON.stringify(moduleName)}`;
    }).join("\n");
    const canonicalFileName = plugin.normalizePath(originalHost.getCanonicalFileName(syntheticFileName));
    syntheticRoots.set(canonicalFileName, { fileName: syntheticFileName, text });
  }
  const getSourceFile = originalHost.getSourceFile.bind(originalHost);
  const fileExists = originalHost.fileExists.bind(originalHost);
  const readFile = originalHost.readFile.bind(originalHost);
  const releasedSourceFiles = /* @__PURE__ */ new Set();
  const getCanonicalFileName = (fileName) => plugin.normalizePath(originalHost.getCanonicalFileName(fileName));
  const getSyntheticRoot = (fileName) => syntheticRoots.get(getCanonicalFileName(fileName));
  const host = {
    ...originalHost,
    fileExists(fileName) {
      return !!getSyntheticRoot(fileName) || fileExists(fileName);
    },
    readFile(fileName) {
      return getSyntheticRoot(fileName)?.text ?? readFile(fileName);
    },
    getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) {
      if (releasedSourceFiles.has(getCanonicalFileName(fileName))) return void 0;
      const syntheticRoot = getSyntheticRoot(fileName);
      if (!syntheticRoot) {
        return getSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
      }
      if (!syntheticRoot.sourceFile || shouldCreateNewSourceFile) {
        syntheticRoot.sourceFile = plugin.ts.createSourceFile(
          syntheticRoot.fileName,
          syntheticRoot.text,
          languageVersionOrOptions,
          true,
          plugin.ts.ScriptKind.TS
        );
        internalSourceFiles.add(syntheticRoot.sourceFile);
      }
      return syntheticRoot.sourceFile;
    }
  };
  const preparedOptions = {
    ...options,
    host,
    rootNames: [...options.rootNames, ...[...syntheticRoots.values()].map((root) => root.fileName)]
  };
  return {
    options: preparedOptions,
    releaseSourceFile(fileName) {
      const canonicalFileName = getCanonicalFileName(fileName);
      releasedSourceFiles.add(canonicalFileName);
      try {
        preparedOptions.host?.getSourceFile(fileName, plugin.ts.ScriptTarget.Latest);
      } finally {
        releasedSourceFiles.delete(canonicalFileName);
      }
    }
  };
}
const createVueProgram = typescript.proxyCreateProgram(plugin.ts, plugin.ts.createProgram, (ts2, options) => {
  const { configFilePath } = options.options;
  const vueOptions = typeof configFilePath === "string" ? createParsedCommandLine(ts2, ts2.sys, plugin.slash(configFilePath)).vueOptions : languageCore.getDefaultCompilerOptions();
  const vueLanguagePlugin = languageCore.createVueLanguagePlugin(
    ts2,
    options.options,
    vueOptions,
    (id) => id
  );
  return {
    languagePlugins: [vueLanguagePlugin],
    setup(instance) {
      activeLanguage = instance;
    }
  };
});
const createProgram = (options) => {
  const prepared = prepareVueProgramOptions(options);
  const program = createVueProgram(prepared.options);
  if (activeLanguage) programLanguages.set(program, activeLanguage);
  if (prepared.releaseSourceFile) {
    programSourceFileReleasers.set(program, prepared.releaseSourceFile);
  }
  return program;
};
function isInternalSourceFile(sourceFile) {
  return internalSourceFiles.has(sourceFile);
}
function releaseSourceFile(program, fileName) {
  programLanguages.get(program)?.scripts.delete(fileName);
  programSourceFileReleasers.get(program)?.(fileName);
}

exports.createParsedCommandLine = createParsedCommandLine;
exports.createProgram = createProgram;
exports.groupVueRootNames = groupVueRootNames;
exports.isInternalSourceFile = isInternalSourceFile;
exports.needsModuleResolutionFallback = needsModuleResolutionFallback;
exports.releaseSourceFile = releaseSourceFile;
