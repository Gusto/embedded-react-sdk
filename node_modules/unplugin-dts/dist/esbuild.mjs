
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
import { createEsbuildPlugin } from 'unplugin';
import { p as pluginFactory } from './shared/unplugin-dts.Cl9Yl0J7.mjs';
import 'node:path';
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

const esbuild = createEsbuildPlugin(pluginFactory);

export { esbuild as default };
