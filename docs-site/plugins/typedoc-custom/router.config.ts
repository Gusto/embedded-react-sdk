/**
 * Single source of truth for the reference IA. `NAMESPACE_PATHS` (utils.ts), the
 * hub/hooks pages, and the `_category_.json` sidebar files are all derived from it.
 * Array order sets sidebar position (domains, then namespaces within each domain).
 *
 * A multi-namespace domain (each namespace has a `subpath`) vs. a single-namespace
 * domain (no `subpath`) generate different trees:
 *
 *   {path}/                          ← multi-namespace, e.g. Employees
 *     index.mdx                      title: {label}        (domain hub)
 *     {namespace.subpath}/           e.g. onboarding/
 *       index.md                     title: {namespace.id}  (namespace hub)
 *       {flow}-flow.md               one page per *Flow component
 *       blocks.md                    all non-flow components
 *     hooks/                         (only if the domain has hooks)
 *       index.mdx, use-*.md
 *
 *   {path}/                          ← single-namespace, e.g. Payroll
 *     index.mdx                      title: {label}        (domain hub)
 *     namespace.md                   title: {namespace.id}  (namespace hub, no subpath)
 *     {flow}-flow.md, blocks.md
 *
 * To add a namespace: add `{ id, subpath }` to a domain. `id` must match the
 * namespace exported from `src/components/index.ts`.
 * To add a domain: append an entry. `path` doubles as the source-dir lookup
 * (`time-off` → `src/components/TimeOff`), so a GUIDE.md there is slotted into the hub.
 */
import { CUSTOM_GROUPS, type CustomGroupTag } from '../../typedoc-utils.ts'

export const DOMAINS: DomainConfig[] = [
  {
    label: 'Companies',
    path: 'company',
    namespaces: [
      { id: 'CompanyOnboarding', subpath: 'onboarding' },
      { id: 'InformationRequests', subpath: 'information-requests' },
    ],
  },
  {
    label: 'Employees',
    path: 'employee',
    namespaces: [
      { id: 'EmployeeOnboarding', subpath: 'onboarding' },
      { id: 'EmployeeManagement', subpath: 'management' },
    ],
  },
  {
    label: 'Contractors',
    path: 'contractor',
    namespaces: [
      { id: 'ContractorOnboarding', subpath: 'onboarding' },
      { id: 'ContractorManagement', subpath: 'management' },
    ],
  },
  {
    label: 'Payroll',
    path: 'payroll',
    namespaces: [{ id: 'Payroll' }],
  },
  {
    label: 'Time off',
    path: 'time-off',
    namespaces: [{ id: 'TimeOff' }],
  },
]

/**
 * Project-level reflections that don't belong to a domain, each consolidated onto
 * one top-level page (instead of being anchored on the project index). A reflection
 * is routed here when its source path contains any `sources` fragment; `groups`
 * narrows further to reflections carrying a matching `@group` tag. Array order sets
 * sidebar position (after all domains: DOMAINS.length + index + 1).
 *
 *   {id}.md                          title: {displayName}
 *     ← every reflection whose source path contains a `sources` fragment
 *       (and, if `groups` is set, carries a matching @group tag)
 *
 * To add a page: append an entry with a unique `id` (the output slug), the
 * `sources` path fragments to match, and the `displayName` used as the page H1.
 */
export const STANDALONE_PAGES: StandalonePageConfig[] = [
  {
    id: 'theme-variables',
    sources: ['contexts/ThemeProvider'],
    displayName: 'Theme variables',
    intro:
      'These design tokens control the visual appearance of all components and UX within the SDK. ' +
      'See the [theming guide](../guides/theming.md) for more context.',
    layout: { default: 'promote' },
  },
  {
    id: 'component-inventory',
    sources: [
      'components/Common/UI',
      'components/Common/FieldLayout',
      'components/Common/PaginationControl',
      'components/Common/PayrollLoading',
      'components/Common/HorizontalFieldLayout',
      'contexts/ComponentAdapter',
    ],
    displayName: 'Component inventory',
    layout: {
      feature: [{ group: 'Component adapter', promote: true }, { group: 'Component props' }],
    },
  },
  {
    id: 'hooks',
    sources: ['partner-hook-utils'],
    displayName: 'Hooks',
    intro:
      'The shared types and helpers behind the SDK hooks. For concepts and usage — the form vs. data hook distinction, connecting fields, error handling, and composition — see the [Hooks guide](../guides/hooks/overview.md).',
    layout: {
      feature: [
        { group: CUSTOM_GROUPS.providers, promote: true },
        {
          group: CUSTOM_GROUPS.formComposition,
          note: '_Usage: [Composing multiple hooks](../guides/hooks/composing-multiple-hooks.md) and [Handling hook errors](../guides/hooks/handling-hook-errors.md)._',
        },
        {
          group: CUSTOM_GROUPS.commonHookResults,
          note: '_The shape every hook returns — see the [Hooks overview](../guides/hooks/overview.md)._',
        },
        {
          group: CUSTOM_GROUPS.formHookResults,
          note: '_Returned by form hooks — see the [Hooks overview](../guides/hooks/overview.md)._',
        },
        {
          group: CUSTOM_GROUPS.hookFieldProps,
          note: '_Configure field behavior in [Configuring form fields](../guides/hooks/configuring-form-fields.md)._',
        },
      ],
      default: 'utilityTypes',
    },
  },
  {
    id: 'events',
    // `shared/constants` supplies the event catalog + EventType; `Base/useBase` supplies
    // OnEventType. The `groups` filter keeps out any non-event constants sharing those paths.
    sources: ['shared/constants', 'components/Base/useBase'],
    groups: [CUSTOM_GROUPS.eventNames, CUSTOM_GROUPS.utilityTypes],
    displayName: 'Events',
  },
]

/**
 * Section-layout overrides for top-level namespace pages, keyed by TypeDoc
 * namespace name (e.g. `APIModels`). Same semantics as
 * {@link StandalonePageConfig.layout}: a namespace with an entry here routes
 * through the standalone layout renderer instead of the default template.
 * Only flat namespaces (no Flow children — see `FLAT_NAMESPACES` in router.ts)
 * are supported; the H1 comes from the frontmatter title and the namespace's
 * summary prose is preserved above the sections.
 */
export const NAMESPACE_LAYOUTS: Record<string, PageLayout> = {
  // Every entity type as its own `## H2`, no "Variables" group heading.
  APIModels: { default: 'promote' },
}

/**
 * Top-level exports relocated from the project index onto the `Translations`
 * page (grouped under "Types" above the per-namespace key interfaces). Matched
 * by source path + `@group`, mirroring {@link STANDALONE_PAGES}: a reflection is
 * moved when its source path contains any `sources` fragment AND it carries a
 * matching `@group` tag. Targeting the i18n source files narrows the group match
 * so an unrelated `@group Utility types` export elsewhere can't leak onto the
 * page. Captures the override types (`Resources`, `ResourceDictionary`,
 * `GlobalResourceDictionary`) plus i18n-adjacent utilities (`DeepPartial`,
 * `SupportedLanguages`). See {@link SDKRouter.relocateI18nTypes}.
 */
export const I18N_RELOCATION: { sources: string[]; groups: CustomGroupTag[] } = {
  sources: ['i18n/types', 'types/Helpers'],
  groups: [CUSTOM_GROUPS.utilityTypes],
}

/** Emoji for each content type — used in DocCardList item labels and hub section headings. */
export const TYPE_EMOJIS = {
  namespace: '📁',
  flow: '🚂',
  block: '🧩',
  hooks: '🪝',
  formHook: '✍️',
  dataHook: '🌐',
} as const

type NamespaceConfig = {
  /** TypeDoc namespace name, matching the export in `src/components/index.ts`. */
  id: string
  /**
   * Output subdirectory under the domain path (e.g. `management` →
   * `employee/management/`). Determines layout: namespaces with a `subpath` are
   * multi-namespace domains whose hub is `index`; omit it for a single-namespace
   * domain, whose namespace page is `namespace.md` (distinct from the domain hub).
   */
  subpath?: string
}
type DomainConfig = {
  /** Sidebar category label and domain hub H1 (e.g. `Employees`). */
  label: string
  /** Lowercase output slug and source-dir lookup key (e.g. `employee`, `time-off`). */
  path: string
  /** Namespaces under this domain, in render order. */
  namespaces: NamespaceConfig[]
}

export type StandalonePageConfig = {
  /** Output page slug (e.g. `theme-variables` → `docs/reference/theme-variables.md`). */
  id: string
  /** Source-path fragments; a reflection is routed here if its path contains any of them. */
  sources: string[]
  /** Optional `@group` names; when set, only reflections in a matching group are included. */
  groups?: CustomGroupTag[]
  /** Page H1 and synthetic namespace name. */
  displayName: string
  /**
   * Optional Markdown prose rendered as the page's leading description, above
   * all sections (below the H1). The synthetic namespace carries no TSDoc of its
   * own, so this is the only page-level intro slot. Use it for a one-line framing
   * plus cross-links to the relevant guides; relative `.md` links resolve the same
   * as anywhere else in `docs/` (e.g. `../guides/theming.md`).
   */
  intro?: string
  /**
   * Optional per-page section layout. When omitted the page renders with the
   * default template (kind-based groups as `## H2`, members as `### H3`). When
   * present the page routes through the standalone layout renderer, which lays
   * out sections in this order: the `feature` groups (in the order listed),
   * then everything else per `default`. See {@link PageLayout}.
   */
  layout?: PageLayout
}

/**
 * Declarative section layout for a standalone page. Opting a page in (setting
 * {@link StandalonePageConfig.layout}) switches it from the default template to
 * the standalone layout renderer.
 */
export type PageLayout = {
  /**
   * Groups promoted to the top of the page, rendered as leading H2 sections in
   * the order listed. `promote: true` lifts each member of the group to its own
   * `## H2` (the group heading is dropped); otherwise the group name is the
   * `## H2` and its members are `### H3`. An optional `note` is Markdown emitted
   * directly under the group heading (e.g. a cross-link to the relevant guide);
   * it is ignored for `promote`d groups, which have no heading to sit under.
   */
  feature?: Array<{ group: CustomGroupTag; promote?: boolean; note?: string }>
  /**
   * How to render every member not claimed by a `feature` group.
   * `'utilityTypes'` collects them under a single `## Utility types` H2 with
   * `### H3` members; `'promote'` renders each as its own `## H2`. Defaults to
   * `'utilityTypes'`.
   */
  default?: 'utilityTypes' | 'promote'
  /**
   * Member ordering within each section. `'alpha'` (default) sorts by name;
   * `'source'` preserves declaration order. Either way `@siblingOf` and `@childOf`
   * still pulls a member to follow its target.
   */
  sort?: 'alpha' | 'source'
}
