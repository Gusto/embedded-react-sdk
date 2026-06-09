import { type TypeDocOptions } from 'typedoc'

export const baseOptions = {
  plugin: ['./plugins/sdk-router.mjs'],
  name: '@gusto/embedded-react-sdk',
  tsconfig: 'tsconfig.typedoc.json',
  entryPoints: ['../src/index.ts'],
  out: '../docs/api',

  excludeInternal: true,
  router: 'sdk-router',
  readme: 'none',
  useHTMLAnchors: true,
  validation: { invalidLink: true },
} satisfies TypeDocOptions

export default {
  ...baseOptions,
  // When running typedoc directly, we need to specify the plugins that docusaurus adds automatically
  plugin: ['typedoc-plugin-markdown', 'typedoc-docusaurus-theme', ...baseOptions.plugin],
}
