import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import type { LockfileData, ProcessedPage } from '../../shared/types'

export interface PageWithParent {
  page: ProcessedPage
  parentId?: string
  parentSlug?: string
}

export class LockFileReader {
  readLockFile(filePath: string): LockfileData {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const lockData = yaml.load(content) as LockfileData

      if (!lockData.categories.length) {
        throw new Error('Invalid lock file format: no categories found')
      }

      return lockData
    } catch (error) {
      throw new Error(`Failed to read lock file: ${(error as Error).message}`)
    }
  }

  extractAllPages(lockData: LockfileData): ProcessedPage[] {
    const allPages: ProcessedPage[] = []

    for (const category of lockData.categories) {
      this.extractPagesRecursively(category.structure, allPages)
    }

    return allPages
  }

  extractAllPagesWithParents(lockData: LockfileData): PageWithParent[] {
    const allPages: PageWithParent[] = []

    for (const category of lockData.categories) {
      this.extractPagesWithParentsRecursively(category.structure, allPages)
    }

    return allPages
  }

  private extractPagesRecursively(pages: ProcessedPage[], accumulator: ProcessedPage[]): void {
    for (const page of pages) {
      accumulator.push(page)

      if (page.children.length > 0) {
        this.extractPagesRecursively(page.children, accumulator)
      }
    }
  }

  private extractPagesWithParentsRecursively(
    pages: ProcessedPage[],
    accumulator: PageWithParent[],
    parentId?: string,
    parentSlug?: string,
  ): void {
    for (const page of pages) {
      accumulator.push({
        page,
        parentId,
        parentSlug,
      })

      if (page.children.length > 0) {
        this.extractPagesWithParentsRecursively(
          page.children,
          accumulator,
          page.id || undefined,
          page.slug || undefined,
        )
      }
    }
  }
}
