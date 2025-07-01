/**
 * Shared types for the documentation system
 */

// Core documentation page structure
export interface DocsLockPage {
  id?: string
  title: string
  slug?: string
  order?: number
  hidden?: boolean
  localPath?: string
  isNew?: boolean
  children: DocsLockPage[]
}

// Documentation category grouping
export interface DocsLockCategory {
  id: string
  title: string
  slug: string
  totalPages: number
  structure: DocsLockPage[]
}

// Complete lockfile structure
export interface DocsLockData {
  categories: DocsLockCategory[]
  timestamp: string
  totalPages: number
  pagesWithChildren: number
  targetCategory: string
  totalCategories: number
  metadata: {
    apiRequestCount: number
    discoveredRelationships: number
    hierarchicalRelationships: number
    executionTimeMs: number
  }
}
