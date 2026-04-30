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
  Companies: [],
  Contractors: [
    {
      name: 'Contractor Management',
      path: '/design/contractor-management',
      description:
        'A prototype flow for managing contractors — view the list and drill into individual profiles.',
    },
  ],
  Employees: [],
  Payroll: [],
}
