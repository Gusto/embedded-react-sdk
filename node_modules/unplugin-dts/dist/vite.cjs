'use strict';

const unplugin = require('unplugin');
const plugin = require('./shared/unplugin-dts.D13_aqpS.cjs');
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

const vite = unplugin.createVitePlugin(plugin.pluginFactory);

module.exports = vite;
