/**
 * Single source of truth for the SDK's custom typedoc `@group` names.
 *
 * Keyed by a semantic id; each value is the display string rendered as a section
 * heading in the reference. Everything else derives from this object: the eslint
 * rule's valid-group set ({@link VALID_GROUPS}), the reference group ordering
 * ({@link GROUP_ORDER}), and the group titles produced by the typedoc-custom
 * plugin. Add or rename a group here and it propagates everywhere.
 */
export const CUSTOM_GROUPS = {
  // Components
  flowComponents: 'Flow components',
  blockComponents: 'Block components',
  components: 'Components',

  // Hooks
  formHooks: 'Form hooks',
  dataHooks: 'Data hooks',
  utilityHooks: 'Utility hooks',
  hooks: 'Hooks',

  // Hook components are exposed as fields, usually auto-tagged by typedoc-custom plugin
  fields: 'Fields',

  // Component adapter + all the props for each slot
  componentAdapter: 'Component adapter',
  componentProps: 'Component props',

  // Catch-all for types that support the main focus of the documentation
  utilityTypes: 'Utility types',

  // Namespaces and synthetic sections produced by the typedoc-custom plugin
  componentNamespaces: 'Component namespaces',
  domains: 'Domains',
  eventNames: 'Event names',
  translationNamespaces: 'Translation namespaces',
  validations: 'Validations',
} as const

export type CustomGroupTag = (typeof CUSTOM_GROUPS)[keyof typeof CUSTOM_GROUPS]

/**
 * TypeDoc's built-in reflection-kind group titles — the English plural of each
 * `ReflectionKind`, exactly as `ReflectionKind.pluralString` emits them. TypeDoc
 * owns these strings; they're mirrored here (rather than imported) so this module
 * stays dependency-free and importable by the eslint rule, which runs outside
 * docs-site where `typedoc` isn't resolvable. Referenced by name in
 * {@link GROUP_ORDER} so the built-in groups slot in alongside {@link CUSTOM_GROUPS}.
 */
export const DEFAULT_GROUPS = {
  documents: 'Documents',
  modules: 'Modules',
  namespaces: 'Namespaces',
  enumerations: 'Enumerations',
  enumerationMembers: 'Enumeration Members',
  classes: 'Classes',
  interfaces: 'Interfaces',
  typeAliases: 'Type Aliases',
  constructors: 'Constructors',
  properties: 'Properties',
  variables: 'Variables',
  functions: 'Functions',
  accessors: 'Accessors',
  methods: 'Methods',
  references: 'References',
} as const

/** Every valid `@group` value; the `tsdoc-valid-group` eslint rule enforces this set. */
export const VALID_GROUPS = new Set<string>(Object.values(CUSTOM_GROUPS))

/**
 * The one display order for groups across the entire reference — used both by
 * TypeDoc's `groupOrder` (regular pages) and by the typedoc-custom router for
 * synthetic pages (hook pages, flow/block splits). Interleaves the SDK's custom
 * groups ({@link CUSTOM_GROUPS}) with TypeDoc's built-in reflection-kind groups
 * ({@link DEFAULT_GROUPS}).
 *
 * Entries absent from a given page are skipped, so front-matter groups
 * (`Domains`, `Namespaces`) and synthetic-only groups (`Validations`,
 * `Enumerations`) coexist in one list. `'*'` catches anything unlisted.
 */
export const GROUP_ORDER = [
  CUSTOM_GROUPS.domains,
  CUSTOM_GROUPS.componentNamespaces,
  CUSTOM_GROUPS.translationNamespaces,
  DEFAULT_GROUPS.namespaces,

  CUSTOM_GROUPS.flowComponents,
  CUSTOM_GROUPS.blockComponents,

  CUSTOM_GROUPS.formHooks,
  CUSTOM_GROUPS.dataHooks,
  CUSTOM_GROUPS.utilityHooks,
  CUSTOM_GROUPS.hooks,

  CUSTOM_GROUPS.fields,
  CUSTOM_GROUPS.components,
  CUSTOM_GROUPS.componentAdapter,
  CUSTOM_GROUPS.componentProps,
  CUSTOM_GROUPS.eventNames,
  CUSTOM_GROUPS.validations,

  DEFAULT_GROUPS.functions,

  CUSTOM_GROUPS.utilityTypes,
  DEFAULT_GROUPS.variables,
  DEFAULT_GROUPS.interfaces,
  DEFAULT_GROUPS.typeAliases,
  DEFAULT_GROUPS.enumerations,

  '*',
]
