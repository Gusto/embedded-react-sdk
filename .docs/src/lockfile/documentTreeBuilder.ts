import type { ReadMePage, ProcessedPage, LockfileData, ReadMeCategory } from '../shared/types'
import type { LocalFileInfo, FileSystemHandler } from './fileSystemHandler'

// Configuration constants
const DEFAULT_ORDER = 999
const TREE_COLORS = {
  green: '\x1b[32m', // New pages
  yellow: '\x1b[33m', // Updated pages
  red: '\x1b[31m', // Deleted pages
  reset: '\x1b[0m', // Reset color
} as const

interface NewPageInfo {
  page: ProcessedPage
  fileInfo: LocalFileInfo
}

// Utility functions for tree operations
const TreeUtils = {
  sortPages(pages: ProcessedPage[]): ProcessedPage[] {
    return pages.sort((a, b) => (a.order || DEFAULT_ORDER) - (b.order || DEFAULT_ORDER))
  },

  sortChildrenRecursively(pages: ProcessedPage[]): void {
    pages.forEach(page => {
      if (page.children.length > 0) {
        TreeUtils.sortPages(page.children)
        TreeUtils.sortChildrenRecursively(page.children)
      }
    })
  },

  findPageInStructureBySlug(structure: ProcessedPage[], slug: string): ProcessedPage | undefined {
    for (const page of structure) {
      if (page.slug === slug) return page
      if (page.children.length > 0) {
        const found = TreeUtils.findPageInStructureBySlug(page.children, slug)
        if (found) return found
      }
    }
    return undefined
  },

  findParentPage(
    structure: ProcessedPage[],
    newPages: NewPageInfo[],
    fileInfo: LocalFileInfo,
  ): ProcessedPage | undefined {
    if (!fileInfo.parentPath) {
      return undefined
    }

    const pathParts = fileInfo.parentPath.split('/')

    // Try each level of the path hierarchy, from most specific to least specific
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const potentialParentSlug = pathParts[i]
      if (!potentialParentSlug) continue

      // Look for parent in existing structure
      const parentInStructure = TreeUtils.findPageInStructureBySlug(structure, potentialParentSlug)
      if (parentInStructure) {
        return parentInStructure
      }

      // Look for parent in new pages being added
      const parentInNewPages = newPages.find(
        np =>
          (np.page.slug && np.page.slug === potentialParentSlug) ||
          np.fileInfo.parentPath?.endsWith(potentialParentSlug),
      )?.page
      if (parentInNewPages) {
        return parentInNewPages
      }
    }

    return undefined
  },
}

export class DocumentTreeBuilder {
  /**
   * Integrates unmapped local files into the existing document tree structure
   */
  integrateUnmappedFiles(
    structure: ProcessedPage[],
    unmappedFiles: Map<string, LocalFileInfo>,
  ): ProcessedPage[] {
    if (unmappedFiles.size === 0) {
      return structure
    }

    const newPages = this.createNewPagesFromFiles(unmappedFiles)
    const { unplacedPages } = this.establishParentChildRelationships(structure, newPages)

    return this.finalizeStructure(structure, unplacedPages)
  }

  /**
   * Builds the main document tree from ReadMe's hierarchical pages
   */
  buildDocumentTree(
    hierarchicalPages: ReadMePage[],
    localFiles: Map<string, LocalFileInfo>,
    fileSystemHandler: FileSystemHandler,
    detailedPages?: Map<string, ReadMePage>,
  ): ProcessedPage[] {
    const convertPage = this.createPageConverter(localFiles, fileSystemHandler, detailedPages)
    return TreeUtils.sortPages(hierarchicalPages.map(page => convertPage(page)))
  }

  /**
   * Finds files that exist locally but not in ReadMe
   */
  findUnmappedFiles(
    readmePageSlugs: Set<string>,
    localFiles: Map<string, LocalFileInfo>,
  ): Map<string, LocalFileInfo> {
    const unmappedFiles = new Map<string, LocalFileInfo>()
    for (const [fileName, fileInfo] of Array.from(localFiles)) {
      if (!readmePageSlugs.has(fileName)) {
        unmappedFiles.set(fileName, fileInfo)
      }
    }
    return unmappedFiles
  }

  /**
   * Creates the final processing result
   */
  createProcessingResult(
    targetCategory: ReadMeCategory,
    structure: ProcessedPage[],
    totalPagesCount: number,
    apiRequestCount: number,
    startTime?: number,
  ): LockfileData {
    const executionTime = startTime ? Date.now() - startTime : 0

    return {
      timestamp: new Date().toISOString(),
      targetCategory: targetCategory.slug,
      totalCategories: 1,
      totalPages: totalPagesCount,
      pagesWithChildren: structure.filter(p => p.children.length > 0).length,
      categories: [
        {
          id: targetCategory._id || targetCategory.id || '',
          title: targetCategory.title,
          slug: targetCategory.slug,
          order: targetCategory.order,
          totalPages: structure.length,
          structure,
        },
      ],
      metadata: {
        apiRequestCount,
        discoveredRelationships: structure.length,
        hierarchicalRelationships: structure.reduce((sum, p) => sum + p.children.length, 0),
        executionTimeMs: executionTime,
      },
    }
  }

  private createNewPagesFromFiles(unmappedFiles: Map<string, LocalFileInfo>): NewPageInfo[] {
    const newPages: NewPageInfo[] = []

    for (const [_fileName, fileInfo] of Array.from(unmappedFiles)) {
      const newPage: ProcessedPage = {
        id: null,
        title: fileInfo.title,
        slug: null,
        order: DEFAULT_ORDER,
        hidden: false,
        localPath: fileInfo.localPath,
        isNew: true,
        children: [],
      }
      newPages.push({ page: newPage, fileInfo })
    }

    return newPages
  }

  private establishParentChildRelationships(
    structure: ProcessedPage[],
    newPages: NewPageInfo[],
  ): { placedPages: ProcessedPage[]; unplacedPages: ProcessedPage[] } {
    const placedPages: ProcessedPage[] = []
    const unplacedPages: ProcessedPage[] = []

    for (const { page: newPage, fileInfo } of newPages) {
      const parentPage = TreeUtils.findParentPage(structure, newPages, fileInfo)

      if (parentPage) {
        parentPage.children.push(newPage)
        placedPages.push(newPage)
      } else {
        unplacedPages.push(newPage)
      }
    }

    return { placedPages, unplacedPages }
  }

  private finalizeStructure(
    structure: ProcessedPage[],
    unplacedPages: ProcessedPage[],
  ): ProcessedPage[] {
    // Add unplaced pages as root pages
    structure.push(...unplacedPages)

    // Sort everything
    TreeUtils.sortPages(structure)
    TreeUtils.sortChildrenRecursively(structure)

    return structure
  }

  private createPageConverter(
    localFiles: Map<string, LocalFileInfo>,
    fileSystemHandler: FileSystemHandler,
    detailedPages?: Map<string, ReadMePage>,
  ) {
    return (page: ReadMePage, parentSlug?: string, grandparentSlug?: string): ProcessedPage => {
      const pageData = detailedPages?.get(page.slug) || page

      const localPath = fileSystemHandler.generateLocalPath(
        page.slug,
        parentSlug,
        grandparentSlug,
        localFiles,
      )

      const isDeleted = !localPath // If no local path found, file has been deleted
      const isUpdated =
        !isDeleted && this.checkIfFileIsUpdated(localPath, pageData.updatedAt, fileSystemHandler)

      return {
        id: pageData._id || pageData.id || '',
        title: pageData.title,
        slug: pageData.slug,
        order: pageData.order,
        hidden: pageData.hidden,
        lastUpdated: pageData.updatedAt,
        revision: pageData.revision,
        localPath,
        isNew: false,
        isDeleted,
        isUpdated,
        children: TreeUtils.sortPages(
          (page.children || []).map(child =>
            this.createPageConverter(localFiles, fileSystemHandler, detailedPages)(
              child,
              page.slug,
              parentSlug,
            ),
          ),
        ),
      }
    }
  }

  private checkIfFileIsUpdated(
    localPath: string | undefined,
    readmeUpdatedAt: string | undefined,
    fileSystemHandler: FileSystemHandler,
  ): boolean {
    if (!localPath || !readmeUpdatedAt) {
      return false
    }

    try {
      const fileModTime = fileSystemHandler.getFileModificationTime(localPath)
      if (!fileModTime) {
        return false
      }

      const readmeTime = new Date(readmeUpdatedAt)
      return fileModTime > readmeTime
    } catch (error) {
      return false
    }
  }
}

/**
 * Tree visualization utilities - follows single responsibility principle
 */
export const TreeRenderer = {
  formatTreeSummary(result: LockfileData): string {
    const lines: string[] = []
    lines.push('\n📊 PROCESSING SUMMARY')
    lines.push('='.repeat(30))

    const category = result.categories[0]
    if (!category) {
      lines.push('❌ No categories found')
      return lines.join('\n')
    }

    lines.push(`📁 Category: ${category.title}`)
    lines.push(`📄 Total Pages: ${result.totalPages}`)
    lines.push(`🔗 Pages with Children: ${result.pagesWithChildren}`)
    lines.push(`🌐 API Requests: ${result.metadata.apiRequestCount}`)

    lines.push('\n📋 Document Tree Structure:')
    lines.push(category.title)
    lines.push(TreeRenderer.formatTreeStructure(category.structure, ''))

    return lines.join('\n')
  },

  formatTreeStructure(pages: ProcessedPage[], prefix: string): string {
    const lines: string[] = []

    pages.forEach((page, i) => {
      const isLast = i === pages.length - 1
      const connector = isLast ? '└── ' : '├── '
      const newPrefix = prefix + (isLast ? '    ' : '│   ')

      const statusIndicator = TreeRenderer.getStatusIndicator(page)
      lines.push(`${prefix}${connector}${page.title}${statusIndicator}`)

      if (page.children.length > 0) {
        lines.push(TreeRenderer.formatTreeStructure(page.children, newPrefix))
      }
    })

    return lines.join('\n')
  },

  getStatusIndicator(page: ProcessedPage): string {
    if (page.isNew) {
      return ` ${TREE_COLORS.green}(new)${TREE_COLORS.reset}`
    } else if (page.isUpdated) {
      return ` ${TREE_COLORS.yellow}(updated)${TREE_COLORS.reset}`
    } else if (page.isDeleted) {
      return ` ${TREE_COLORS.red}(deleted)${TREE_COLORS.reset}`
    }
    return ''
  },
}
