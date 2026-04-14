export type Category = (typeof CATEGORIES)[number]

export const CATEGORIES = ['Examples'] as const

export interface PrototypeEntry {
  name: string
  path: string
}

export type CategorizedRegistry = Record<Category, PrototypeEntry[]>

export const categorizedRegistry: CategorizedRegistry = {
  Examples: [
    { name: 'Component Showcase', path: '/component-showcase' },
    { name: 'Sample Flow', path: '/sample-flow' },
  ],
  // Add new categories and prototypes here
}
