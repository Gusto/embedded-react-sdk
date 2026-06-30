import { type TypeDocOptions, OptionDefaults } from 'typedoc'
import { type PluginOptions } from 'typedoc-plugin-markdown'
import {
  COMPONENT_GROUPS,
  HOOK_GROUPS,
  COMPONENT_PROP_GROUPS,
  VARIABLE_GROUPS,
} from './typedoc-utils.mjs'

export const baseOptions = {
  plugin: ['./plugins/typedoc-custom/index.ts'],
  name: '@gusto/embedded-react-sdk',
  tsconfig: 'tsconfig.typedoc.json',
  entryPoints: ['../src/index.ts'],
  out: '../docs/reference',

  groupOrder: [
    'Domains',
    'Namespaces',
    ...HOOK_GROUPS,
    ...COMPONENT_GROUPS,
    ...VARIABLE_GROUPS,
    'Functions',
    'Variables',
    'Interfaces',
    'Type Aliases',
    ...COMPONENT_PROP_GROUPS,
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

  sort: ['required-first', 'alphabetical'],

  excludeNotDocumented: false,
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  expandObjects: false,
  expandParameters: true,

  strikeDeprecatedPageTitles: false,

  router: 'sdk-router',
  theme: 'sdk-theme',
  readme: 'none',
  useHTMLAnchors: true,
  validation: { invalidLink: true },
  formatWithPrettier: false,

  // Custom block tags. `@components` lists the components/hooks a flow composes
  // (rendered as a table by the SDK theme); `@events` documents events separately
  // from `@remarks`; `@groupWith {@link X}` pins a type to render immediately after
  // sibling `X` in its group. Spread the defaults so the built-in tags are kept.
  blockTags: [...OptionDefaults.blockTags, '@components', '@events', '@groupWith'],
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
