export type Category = (typeof CATEGORIES)[number]

export const CATEGORIES = ['Examples', 'Companies', 'Contractors', 'Employees', 'Payroll'] as const

export interface PrototypeEntry {
  name: string
  path: string
  description: string
}

export type CategorizedRegistry = Record<Category, PrototypeEntry[]>

export const categorizedRegistry: CategorizedRegistry = {
  Examples: [
    {
      name: 'Component Showcase',
      path: '/design/component-showcase',
      description:
        'A single page demonstrating SDK components like Button, TextInput, Select, Alert, and more.',
    },
  ],
  Companies: [
    {
      name: 'Tax Filings',
      path: '/design/tax-filings',
      description:
        'View tax filing status for a company — filter, sort, and drill into individual filings.',
    },
    {
      name: 'Agent Payments',
      path: '/design/agent-payments',
      description:
        'View tax payment status for a company — outstanding amounts, agencies, due dates, and per-payroll tax liabilities.',
    },
    {
      name: 'Payroll Reversals',
      path: '/design/payroll-reversals',
      description:
        'Step-by-step payroll reversal wizard — select payroll, choose employees, review and confirm.',
    },
  ],
  Contractors: [
    {
      name: 'Contractor Management',
      path: '/design/contractor-management',
      description:
        'A prototype flow for managing contractors — view the list and drill into individual profiles.',
    },
    {
      name: 'Contractor Self-Onboarding',
      path: '/design/contractor-self-onboarding',
      description: 'The contractor-facing onboarding experience after receiving an invite link.',
    },
  ],
  Employees: [],
  Payroll: [],
}
