// To add a namespace: add an entry to the relevant domain's `namespaces` array in DOMAINS.
// To add a domain: add a new entry to DOMAINS. NAMESPACE_PATHS and DOMAIN_HUBS are
// derived automatically — do not edit them directly.

type NamespaceConfig = { id: string; subpath?: string }
type DomainConfig = { label: string; path: string; namespaces: NamespaceConfig[] }

export type StandalonePageConfig = {
  id: string
  sources: string[]
  groups?: string[]
  displayName: string
}

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
    label: 'Time Off',
    path: 'time-off',
    namespaces: [{ id: 'TimeOff' }],
  },
]

/** Derived from DOMAINS — do not edit directly.
 *  Maps each namespace id to its output directory prefix. */
export const NAMESPACE_PATHS: Record<string, string> = Object.fromEntries(
  DOMAINS.flatMap(({ path: domainPath, namespaces }) =>
    namespaces.map(ns => [ns.id, ns.subpath ? `${domainPath}/${ns.subpath}` : domainPath]),
  ),
)

/** Derived from DOMAINS — do not edit directly.
 *  Maps each domain path to the ordered list of namespace ids shown on its hub page. */
export const DOMAIN_HUBS: Record<string, string[]> = Object.fromEntries(
  DOMAINS.map(d => [d.path, d.namespaces.map(n => n.id)]),
)

/** Emoji for each content type — used in DocCardList item labels and hub section headings. */
export const TYPE_EMOJIS = {
  namespace: '📁',
  flow: '🚂',
  block: '🧩',
  hooks: '🪝',
  formHook: '✍️',
  dataHook: '🌐',
} as const

export const STANDALONE_PAGES: StandalonePageConfig[] = [
  {
    id: 'theme-variables',
    sources: ['contexts/ThemeProvider'],
    displayName: 'Theme Variables',
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
    displayName: 'Component Inventory',
  },
  { id: 'utilities', sources: ['partner-hook-utils'], displayName: 'Hook Utilities' },
  {
    id: 'events',
    sources: ['shared/constants'],
    groups: ['Events'],
    displayName: 'Events',
  },
]
