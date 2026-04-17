export type Category = (typeof CATEGORIES)[number]

export const CATEGORIES = ['Examples', 'Contractor Management'] as const

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
  'Contractor Management': [
    {
      name: 'Contractor Profile',
      path: '/design/contractor-profile',
      description: 'A prototype for managing contractor profiles.',
    },
  ],
}
