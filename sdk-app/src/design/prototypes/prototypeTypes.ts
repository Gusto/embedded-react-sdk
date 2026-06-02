import type { ReactNode } from 'react'
import type { RequestHandler } from 'msw'

export interface PrototypeConfiguration {
  /** URL segment, e.g. "single-job" */
  slug: string
  /** Sidebar label, e.g. "Single job" */
  name: string
  /** Optional helper text */
  description?: string
  /** MSW handlers installed while this configuration is active */
  handlers: RequestHandler[]
  /** Renders the component under test with the mocked data */
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
