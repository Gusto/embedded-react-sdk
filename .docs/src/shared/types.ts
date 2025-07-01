/**
 * Shared types for the documentation system
 */

// ReadMe API types
export interface ReadMeCategory {
  _id?: string
  id?: string
  title: string
  slug: string
  order?: number
  type?: string
}

export interface ReadMePage {
  _id?: string
  id?: string
  title: string
  slug: string
  order?: number
  hidden?: boolean
  parentDoc?: string
  category?: string
  updatedAt?: string
  revision?: number
  children?: ReadMePage[]
  next?: {
    pages?: Array<{
      name: string
      slug: string
    }>
  }
}

// Processed documentation page structure
export interface ProcessedPage {
  id: string | null
  title: string
  slug: string | null
  order?: number
  hidden?: boolean
  lastUpdated?: string
  revision?: number
  localPath?: string
  isNew?: boolean
  isDeleted?: boolean
  isUpdated?: boolean
  children: ProcessedPage[]
}

// Processed category structure
export interface ProcessedCategory {
  id: string
  title: string
  slug: string
  order?: number
  totalPages: number
  structure: ProcessedPage[]
}

// Complete lockfile data structure
export interface LockfileData {
  timestamp: string
  targetCategory: string
  totalCategories: number
  totalPages: number
  pagesWithChildren: number
  categories: ProcessedCategory[]
  metadata: {
    apiRequestCount: number
    discoveredRelationships: number
    hierarchicalRelationships: number
    executionTimeMs: number
  }
}

// Local file information for processing
export interface LocalFileInfo {
  title: string
  localPath: string
  parentPath?: string
}

// Frontmatter data
export interface FrontmatterData {
  title?: string
  description?: string
  category?: string
  order?: number
  hidden?: boolean
  slug?: string
  readmeId?: string
  lastUpdated?: string
  [key: string]: unknown
}
