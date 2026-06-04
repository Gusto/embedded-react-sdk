import type { ReactNode } from 'react'

export interface PrototypeConfiguration {
  /** URL segment, e.g. "single-job" */
  slug: string
  /** Sidebar label, e.g. "Single job" */
  name: string
  /** Optional helper text */
  description?: string
  /** Renders the component under test with mock props */
  render: () => ReactNode
}

export interface PrototypeComponent {
  /** URL segment, e.g. "list" */
  slug: string
  /** Sidebar heading, e.g. "List" */
  name: string
  /** Optional helper text */
  description?: string
  configurations: PrototypeConfiguration[]
}
