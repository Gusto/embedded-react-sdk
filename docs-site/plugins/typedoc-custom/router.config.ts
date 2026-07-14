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

export const SIDEBAR_GROUPS = [
  { id: 'domains', header: 'Browse by domain' },
  { id: 'build-type', header: 'Browse by type' },
  { id: 'default', header: 'Configuration' },
] as const

export type SidebarGroup = (typeof SIDEBAR_GROUPS)[number]['id']

export const DOMAINS: DomainConfig[] = [
  {
    label: 'Companies',
    path: 'company',
    description:
      'Enroll a business with Gusto — company setup, pay schedules, and required form signing — and respond to ongoing compliance information requests.',
    namespaces: [
      { id: 'CompanyOnboarding', subpath: 'onboarding' },
      { id: 'InformationRequests', subpath: 'information-requests' },
    ],
  },
  {
    label: 'Employees',
    path: 'employee',
    description:
      'Onboard and manage W-2 workers (hourly, salary, commissioned, and more) — compensation, banking, tax withholding, documents, and terminations.',
    namespaces: [
      { id: 'EmployeeOnboarding', subpath: 'onboarding' },
      { id: 'EmployeeManagement', subpath: 'management' },
    ],
  },
  {
    label: 'Contractors',
    path: 'contractor',
    description:
      'Onboard and manage 1099 contractors (individual or business) — profile, payment methods, documents, and contractor payments.',
    namespaces: [
      { id: 'ContractorOnboarding', subpath: 'onboarding' },
      { id: 'ContractorManagement', subpath: 'management' },
    ],
  },
  {
    label: 'Payrolls',
    path: 'payroll',
    description:
      'Pay employees and contractors across all pay schedules, including off-cycle, dismissal, and transition payrolls.',
    namespaces: [{ id: 'Payroll' }],
  },
  {
    label: 'Time off policies',
    path: 'time-off',
    description: 'Create and manage policies for vacation, sick leave, and company holidays.',
    namespaces: [{ id: 'TimeOff' }],
  },
]

/**
 * Project-level reflections that don't belong to a domain, each consolidated onto
 * one top-level page (instead of being anchored on the project index). A reflection
 * is routed here when its source path contains any `sources` fragment; `groups`
 * narrows further to reflections carrying a matching `@group` tag.
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
    id: 'workflows',
    sources: [],
    displayName: 'Workflows',
    emoji: '🚂',
    sidebarGroup: 'build-type',
    intro:
      'Full multi-step user experiences as a single component — the fastest path to a working feature. See the [Component types guide](../getting-started/component-types.md) for a comparison of workflows, blocks, and hooks.',
    layout: {
      crossDomainIndex: [{ heading: '🚂 Workflows', kind: 'flows' }],
    },
  },
  {
    id: 'blocks',
    sources: ['components/Base/Base'],
    displayName: 'Blocks',
    emoji: '🧩',
    sidebarGroup: 'build-type',
    intro:
      'Individual form and UI components with SDK logic built in — use these for custom layouts, step reordering, or inserting your own content between SDK steps. See the [Component types guide](../getting-started/component-types.md) for a comparison of workflows, blocks, and hooks.',
    layout: {
      crossDomainIndex: [{ heading: '🧩 Blocks', kind: 'blocks' }],
      default: 'promote',
    },
  },
  {
    id: 'hooks',
    sources: ['partner-hook-utils'],
    displayName: 'Hooks',
    emoji: '🪝',
    sidebarGroup: 'build-type',
    intro:
      'Headless utilities that handle data fetching, form state, validation, and API submission — you own the layout, the SDK handles the business logic. For concepts and usage — the form vs. data hook distinction, connecting fields, error handling, and composition — see the [Hooks guide](../guides/hooks/overview.md).',
    layout: {
      crossDomainIndex: [
        { heading: '🌐 Data hooks', kind: 'dataHooks' },
        { heading: '✍️ Form hooks', kind: 'formHooks' },
      ],
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
    emoji: '⚡',
    intro:
      'Event types fired when users take actions or complete steps in SDK components. ' +
      'Pass a function matching [`OnEventType`](#oneventtype) as the `onEvent` prop. ' +
      'See the [Event handling guide](../guides/integration-guide/event-handling.md) for usage patterns.',
    layout: {
      feature: [{ group: CUSTOM_GROUPS.eventNames, promote: true }],
      default: 'utilityTypes',
    },
  },
  {
    id: 'providers',
    sources: ['contexts/GustoProvider'],
    displayName: 'Providers',
    emoji: '⚙️',
    intro:
      'Top-level providers for configuring auth, locale, and your design system. ' +
      'Wrap your application with one of these before rendering any SDK component.',
    layout: {
      feature: [{ group: CUSTOM_GROUPS.providers, promote: true }],
      default: 'utilityTypes',
    },
  },
  {
    id: 'error-handling',
    sources: ['types/sdkError'],
    displayName: 'Error handling',
    emoji: '⚠️',
    intro:
      'Unified error shape returned by all SDK form hooks and error handlers. ' +
      'Every caught error — API, validation, network, or runtime — is normalized into [`SDKError`](#sdkerror).',
    layout: { default: 'promote' },
  },
  {
    id: 'http-interceptors',
    // `types/hooks` owns SDKHooks; the hook and context interfaces are re-exported
    // from the versioned embedded-api package at `hooks/types`, so both fragments
    // are needed to capture all reflections on this page.
    sources: ['types/hooks', 'hooks/types'],
    displayName: 'HTTP interceptors',
    emoji: '🔌',
    intro:
      'Callback hooks for intercepting and modifying HTTP requests and responses. ' +
      'Pass an [`SDKHooks`](#sdkhooks) instance to [`GustoProvider`](providers.md#gustoprovider) via `config.hooks`.',
    layout: {
      feature: [{ group: CUSTOM_GROUPS.httpInterceptors, promote: true }],
      default: 'utilityTypes',
    },
  },
  {
    id: 'observability',
    sources: ['types/observability'],
    displayName: 'Observability',
    emoji: '📊',
    intro:
      'Callback hooks for error tracking and performance metrics, compatible with tools like Sentry or Datadog. ' +
      'Pass an [`ObservabilityHook`](#observabilityhook) instance to [`GustoProvider`](providers.md#gustoprovider) via `config.observability`.',
    layout: {
      feature: [{ group: CUSTOM_GROUPS.observability, promote: true }],
      default: 'utilityTypes',
    },
  },
  {
    id: 'theme-variables',
    sources: ['contexts/ThemeProvider'],
    displayName: 'Theme variables',
    emoji: '🎨',
    intro:
      'Design tokens for lightweight customization of all SDK UI. ' +
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
    displayName: 'UI component inventory',
    emoji: '🖼️',
    intro:
      'Design system components for advanced customization of all SDK UI. ' +
      'See the [component adapter guide](../guides/component-adapter/component-adapter.md) for more context.',
    layout: {
      feature: [
        { group: CUSTOM_GROUPS.componentAdapter, promote: true },
        { group: CUSTOM_GROUPS.componentProps },
      ],
      default: 'utilityTypes',
    },
  },
  {
    id: 'employee/types',
    // No path matching; types must use `@page employee/types` to show up
    sources: [],
    displayName: 'Types',
    sidebarPosition: 101,
    layout: { default: 'promote' },
  },
  {
    id: 'contractor/types',
    // No path matching; types must use `@page contractor/types` to show up
    sources: [],
    displayName: 'Types',
    sidebarPosition: 101,
    layout: { default: 'promote' },
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
  /** Description for the reference index card. Describes the full domain scope across all namespaces. */
  description?: string
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
   * Which top-level sidebar section this page belongs to. Omit for domain-scoped pages
   * (e.g. `employee/types`) that live inside a domain directory rather than appearing
   * in the top-level reference sidebar groups.
   */
  sidebarGroup?: SidebarGroup
  /**
   * Explicit Docusaurus `sidebar_position` for this page. When set, overrides the
   * default position (`DOMAINS.length + standaloneIdx + 1`). Use for pages nested
   * inside a domain directory (e.g. `employee/types`) that need to appear after
   * subdirectory categories with high explicit positions (e.g. `hooks/` at 100).
   */
  sidebarPosition?: number
  /** Emoji prefix for the reference index card label. Does not affect the page H1. */
  emoji?: string
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
  /**
   * Cross-domain index tables rendered at the top of the page (after the intro
   * prose, before any `feature` sections). Each entry produces one `## H2` table
   * that lists every matching reflection across all domain namespaces, alpha-sorted.
   *
   * - `'flows'`: all `*Flow` components; first column is `Namespace.ComponentName`.
   * - `'blocks'`: all non-flow components; first column is `Namespace.ComponentName`.
   * - `'formHooks'`: per-domain hooks whose name ends in `Form`; first column is the plain hook name.
   * - `'dataHooks'`: per-domain hooks whose name does NOT end in `Form`; first column is the plain hook name.
   */
  crossDomainIndex?: Array<{
    heading: string
    kind: 'flows' | 'blocks' | 'formHooks' | 'dataHooks'
  }>
}
