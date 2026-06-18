// To add a namespace: add an entry to the relevant domain's `namespaces` array in DOMAINS.
// To add a domain: add a new entry to DOMAINS. NAMESPACE_PATHS and DOMAIN_HUBS are
// derived automatically — do not edit them directly.

/**
 * Domain configuration. Defines every domain's sidebar label, output path,
 * its namespaces in display order, and each namespace's output subpath.
 *
 * - `label`      — the Docusaurus sidebar category label for the domain directory.
 * - `path`       — the domain's output directory name (lowercase, kebab-case).
 * - `namespaces` — ordered list of namespaces in this domain.
 *   - `id`       — the TypeScript namespace name (exact match to `export * as X`).
 *   - `label`    — human-readable sidebar label for the namespace's `_category_.json`.
 *   - `subpath`  — output subdirectory within the domain (e.g. `onboarding` →
 *                  `company/onboarding/workflows.md`). Omit for single-namespace domains
 *                  where namespace content sits directly in the domain directory.
 *
 * Domain order here controls sidebar position.
 *
 * @type {{ label: string, path: string, namespaces: { id: string, label: string, subpath?: string }[] }[]}
 */
export const DOMAINS = [
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

/**
 * Derived from DOMAINS — do not edit directly.
 * Maps each namespace id to its output directory prefix.
 */
export const NAMESPACE_PATHS = Object.fromEntries(
  DOMAINS.flatMap(({ path: domainPath, namespaces }) =>
    namespaces.map(ns => [ns.id, ns.subpath ? `${domainPath}/${ns.subpath}` : domainPath]),
  ),
)

/**
 * Derived from DOMAINS — do not edit directly.
 * Maps each domain path to the ordered list of namespace ids shown on its hub page.
 */
export const DOMAIN_HUBS = Object.fromEntries(
  DOMAINS.map(d => [d.path, d.namespaces.map(n => n.id)]),
)

export const STANDALONE_PAGES = {
  'theme-variables': {
    sources: ['contexts/ThemeProvider'],
    displayName: 'Theme Variables',
    sidebarPosition: 2,
  },
  'component-inventory': {
    sources: [
      'components/Common/UI',
      'components/Common/FieldLayout',
      'components/Common/PaginationControl',
      'components/Common/PayrollLoading',
      'components/Common/HorizontalFieldLayout',
      'contexts/ComponentAdapter',
    ],
    displayName: 'Component Inventory',
    sidebarPosition: 3,
  },
  utilities: { sources: ['partner-hook-utils'], displayName: 'Hook Utilities', sidebarPosition: 4 },
  events: {
    sources: ['shared/constants'],
    groups: ['Events'],
    displayName: 'Events',
    sidebarPosition: 5,
  },
}
