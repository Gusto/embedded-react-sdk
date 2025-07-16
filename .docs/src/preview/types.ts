/**
 * Types for the documentation preview server
 */

// Types matching the structure from docs-lock.yml
export interface DocsLockPage {
  id?: string | null
  title: string
  slug?: string | null
  order?: number | null
  hidden?: boolean
  lastUpdated?: string
  revision?: number
  localPath?: string
  isNew?: boolean
  isDeleted?: boolean
  isUpdated?: boolean
  children: DocsLockPage[]
}

export interface DocsLockCategory {
  id: string
  title: string
  slug: string
  order?: number
  totalPages: number
  structure: DocsLockPage[]
}

export interface DocsLockData {
  timestamp: string
  targetCategory: string
  totalCategories: number
  totalPages: number
  pagesWithChildren: number
  categories: DocsLockCategory[]
  metadata: {
    apiRequestCount: number
    discoveredRelationships: number
    hierarchicalRelationships: number
    executionTimeMs: number
  }
}

// Types for the preview interface
export interface PreviewPage {
  title: string
  file: string
  prodUrl: string
  order: number
  readmeId: string | null
  isNew: boolean
  hidden: boolean
  children: PreviewPage[]
}

export interface DocsStructure {
  sections: PreviewPage[]
  metadata: {
    timestamp: string
    totalPages: number
    pagesWithChildren: number
    lastUpdated: string
  }
}
