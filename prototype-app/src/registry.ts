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
      path: '/component-showcase',
      description:
        'A single page demonstrating SDK components like Button, TextInput, Select, Alert, and more.',
    },
    {
      name: 'Sample Flow',
      path: '/sample-flow',
      description:
        'A multi-page prototype showing how to build a step-by-step flow with sub-navigation.',
    },
  ],
  'Contractor Management': [
    {
      name: 'Contractor Profile',
      path: '/contractor-profile',
      description: 'A prototype for managing contractor profiles.',
    },
  ],

  // Add new categories and prototypes here
}
