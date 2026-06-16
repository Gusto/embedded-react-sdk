import { type TypeDocOptions } from 'typedoc'
import { type PluginOptions } from 'typedoc-plugin-markdown'
import { COMPONENT_GROUPS, HOOK_GROUPS, VARIABLE_GROUPS } from './typedoc-utils.mjs'

export const baseOptions = {
  plugin: ['./plugins/sdk-router.ts'],
  name: '@gusto/embedded-react-sdk',
  tsconfig: 'tsconfig.typedoc.json',
  entryPoints: ['../src/index.ts'],
  out: '../docs/api',

  groupOrder: [
    'Domains',
    'Namespaces',
    ...COMPONENT_GROUPS,
    ...HOOK_GROUPS,
    ...VARIABLE_GROUPS,
    'Functions',
    'Variables',
    'Interfaces',
    '*',
  ],

  indexFormat: 'table',
  propertyMembersFormat: 'table',
  parametersFormat: 'table',
  enumMembersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  typeDeclarationFormat: 'table',

  tableColumnSettings: {
    hideDefaults: false,
    hideInherited: true,
    hideSources: true,
    hideModifiers: true,
    hideValues: true,
    hideOverrides: true,
  },

  excludeNotDocumented: true,
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  strikeDeprecatedPageTitles: false,

  router: 'sdk-router',
  theme: 'sdk-theme',
  readme: 'none',
  useHTMLAnchors: true,
  validation: { invalidLink: true },
} satisfies TypeDocOptions & PluginOptions

export default {
  ...baseOptions,
  // When running typedoc directly, we need to specify the plugins that docusaurus adds automatically
  plugin: ['typedoc-plugin-markdown', 'typedoc-docusaurus-theme', ...baseOptions.plugin],
  sidebar: {
    autoConfiguration: false,
    pretty: false,
    typescript: false,
    deprecatedItemClassName: '',
  },
}
