import { type TypeDocOptions } from 'typedoc'
import { type PluginOptions } from 'typedoc-plugin-markdown'

export const baseOptions = {
  plugin: ['./plugins/sdk-router.ts'],
  name: '@gusto/embedded-react-sdk',
  tsconfig: 'tsconfig.typedoc.json',
  entryPoints: ['../src/index.ts'],
  out: '../docs/api',

  propertyMembersFormat: 'table',
  parametersFormat: 'table',
  enumMembersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  typeDeclarationFormat: 'table',

  excludeInternal: true,
  router: 'sdk-router',
  readme: 'none',
  useHTMLAnchors: true,
  validation: { invalidLink: true },
} satisfies TypeDocOptions & PluginOptions

export default {
  ...baseOptions,
  // When running typedoc directly, we need to specify the plugins that docusaurus adds automatically
  plugin: ['typedoc-plugin-markdown', 'typedoc-docusaurus-theme', ...baseOptions.plugin],
}
