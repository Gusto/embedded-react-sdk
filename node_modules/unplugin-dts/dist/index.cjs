'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const unplugin = require('unplugin');
const plugin$1 = require('./shared/unplugin-dts.D13_aqpS.cjs');
require('node:path');
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

const plugin = /* @__PURE__ */ unplugin.createUnplugin(plugin$1.pluginFactory);

exports.editSourceMapDir = plugin$1.editSourceMapDir;
exports.default = plugin;
