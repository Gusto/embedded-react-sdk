import { type TypeDocOptions, OptionDefaults } from 'typedoc'
import { type PluginOptions } from 'typedoc-plugin-markdown'
import { GROUP_ORDER } from './typedoc-utils.ts'

export const baseOptions = {
  plugin: ['./plugins/typedoc-custom/index.ts'],
  name: '@gusto/embedded-react-sdk',
  tsconfig: 'tsconfig.typedoc.json',
  entryPoints: ['../src/index.ts'],
  out: '../docs/reference',

  groupOrder: GROUP_ORDER,

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

  // Render @remarks/@example in their authored position (with the comment summary),
  // ahead of the Type Declaration / Properties table, instead of after it.
  blockTagsPreserveOrder: ['@remarks', '@example'],

  // Custom block tags. `@components` lists the components/hooks a flow composes
  // (rendered as a table by the SDK theme); `@events` documents events separately
  // from `@remarks`; `@siblingOf {@link X}` pins a type to render immediately after
  // peer `X` at the same level in its group; `@childOf {@link X}` renders a type
  // nested beneath `X` (one deeper heading level) instead of as its own top-level
  // entry. Spread the defaults so the built-in tags are kept.
  blockTags: [...OptionDefaults.blockTags, '@components', '@events', '@siblingOf', '@childOf'],
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
