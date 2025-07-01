// Shared types for the docs system
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

export interface ProcessedCategory {
  id: string
  title: string
  slug: string
  order?: number
  totalPages: number
  structure: ProcessedPage[]
}

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
