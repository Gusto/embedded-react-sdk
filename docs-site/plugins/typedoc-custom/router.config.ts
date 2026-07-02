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
  },
  { id: 'utilities', sources: ['partner-hook-utils'], displayName: 'Hook utilities' },
  {
    id: 'events',
    // `shared/constants` supplies the event catalog + EventType; `Base/useBase` supplies
    // OnEventType. The `groups` filter keeps out any non-event constants sharing those paths.
    sources: ['shared/constants', 'components/Base/useBase'],
    groups: ['Event names', 'Utility types'],
    displayName: 'Events',
  },
]

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
  groups?: string[]
  /** Page H1 and synthetic namespace name. */
  displayName: string
}
