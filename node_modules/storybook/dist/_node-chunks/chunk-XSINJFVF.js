import CJS_COMPAT_NODE_URL_qjinduibsyq from 'node:url';
import CJS_COMPAT_NODE_PATH_qjinduibsyq from 'node:path';
import CJS_COMPAT_NODE_MODULE_qjinduibsyq from "node:module";

var __filename = CJS_COMPAT_NODE_URL_qjinduibsyq.fileURLToPath(import.meta.url);
var __dirname = CJS_COMPAT_NODE_PATH_qjinduibsyq.dirname(__filename);
var require = CJS_COMPAT_NODE_MODULE_qjinduibsyq.createRequire(import.meta.url);

// ------------------------------------------------------------
// end of CJS compatibility banner, injected by Storybook's esbuild configuration
// ------------------------------------------------------------

// src/common/versions.ts
var versions_default = {
  "@storybook/addon-a11y": "10.6.0",
  "@storybook/addon-docs": "10.6.0",
  "@storybook/addon-links": "10.6.0",
  "@storybook/addon-mcp": "10.6.0",
  "@storybook/addon-onboarding": "10.6.0",
  "storybook-addon-pseudo-states": "10.6.0",
  "@storybook/addon-themes": "10.6.0",
  "@storybook/addon-vitest": "10.6.0",
  "@storybook/builder-vite": "10.6.0",
  "@storybook/builder-webpack5": "10.6.0",
  storybook: "10.6.0",
  "@storybook/angular": "10.6.0",
  "@storybook/angular-vite": "10.6.0",
  "@storybook/ember": "10.6.0",
  "@storybook/html-vite": "10.6.0",
  "@storybook/nextjs": "10.6.0",
  "@storybook/nextjs-vite": "10.6.0",
  "@storybook/preact-vite": "10.6.0",
  "@storybook/react-native-web-vite": "10.6.0",
  "@storybook/react-vite": "10.6.0",
  "@storybook/react-webpack5": "10.6.0",
  "@storybook/server-webpack5": "10.6.0",
  "@storybook/svelte-vite": "10.6.0",
  "@storybook/sveltekit": "10.6.0",
  "@storybook/tanstack-react": "10.6.0",
  "@storybook/vue3-vite": "10.6.0",
  "@storybook/web-components-vite": "10.6.0",
  sb: "10.6.0",
  "@storybook/cli": "10.6.0",
  "@storybook/codemod": "10.6.0",
  "@storybook/core-webpack": "10.6.0",
  "create-storybook": "10.6.0",
  "eslint-plugin-storybook": "10.6.0",
  "@storybook/mcp": "10.6.0",
  "@storybook/react-dom-shim": "10.6.0",
  "vite-plugin-storybook-nextjs": "10.6.0",
  "@storybook/preset-create-react-app": "10.6.0",
  "@storybook/preset-react-webpack": "10.6.0",
  "@storybook/preset-server-webpack": "10.6.0",
  "@storybook/html": "10.6.0",
  "@storybook/preact": "10.6.0",
  "@storybook/react": "10.6.0",
  "@storybook/server": "10.6.0",
  "@storybook/svelte": "10.6.0",
  "@storybook/vue3": "10.6.0",
  "@storybook/web-components": "10.6.0"
};

// src/common/node-version.ts
import { satisfies } from "semver";
var MIN_SUPPORTED_NODE_VERSIONS = [
  { major: 20, minor: 19, patch: 0 },
  { major: 22, minor: 12, patch: 0 }
];
function formatMinVersion(v) {
  return v.minor === 0 && v.patch === 0 ? `${v.major}+` : v.patch === 0 ? `${v.major}.${v.minor}+` : `${v.major}.${v.minor}.${v.patch}+`;
}
var MIN_SUPPORTED_NODE_DESCRIPTION = MIN_SUPPORTED_NODE_VERSIONS.map(formatMinVersion).join(" or ");
function isNodeVersionSupported(major, minor, patch) {
  let sortedMinimums = [...MIN_SUPPORTED_NODE_VERSIONS].sort((a, b) => a.major - b.major), supportedRange = sortedMinimums.map((min, index) => {
    let next = sortedMinimums[index + 1], lowerBound = `>=${min.major}.${min.minor}.${min.patch}`;
    return next ? `${lowerBound} <${next.major}.0.0` : lowerBound;
  }).join(" || ");
  return satisfies(`${major}.${minor}.${patch}`, supportedRange);
}

export {
  versions_default,
  MIN_SUPPORTED_NODE_VERSIONS,
  formatMinVersion,
  MIN_SUPPORTED_NODE_DESCRIPTION,
  isNodeVersionSupported
};
