import type { ReadMePage, ProcessedPage, LockfileData, ReadMeCategory } from '../../shared/types'
import type { LocalFileInfo, FileSystemHandler } from './fileSystemHandler'

// Configuration constants
const DEFAULT_ORDER = null
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
    return pages.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })
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

    // Group pages by their parent folder
    const pagesByFolder = this.groupPagesByFolder(newPages)

    // Create parent pages and establish relationships
    const { parentPages, childPages } = this.createParentPagesAndRelationships(pagesByFolder)

    // Add parent pages to the structure
    structure.push(...parentPages)

    // Add remaining child pages as root level
    const unplacedPages = childPages.filter(page => !this.isParentPage(page))

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
    readmePages?: ReadMePage[],
    fileSystemHandler?: FileSystemHandler,
  ): Map<string, LocalFileInfo> {
    const unmappedFiles = new Map<string, LocalFileInfo>()

    // Create a set of all local paths that are already being used by ReadMe pages
    const usedLocalPaths = new Set<string>()
    if (readmePages && fileSystemHandler) {
      for (const readmePage of readmePages) {
        const localPath = fileSystemHandler.findLocalPathByTitleOrSlug(
          readmePage.title,
          readmePage.slug,
          undefined,
          undefined,
          localFiles,
        )
        if (localPath) {
          usedLocalPaths.add(localPath)
        }
      }
    }

    for (const [fileName, fileInfo] of Array.from(localFiles)) {
      // Check if file is already being used by a ReadMe page
      if (usedLocalPaths.has(fileInfo.localPath)) {
        continue // File is already mapped to a ReadMe page
      }

      // Check slug-based matching (existing logic)
      if (readmePageSlugs.has(fileName)) {
        continue // File is mapped by slug
      }

      // Check title-based matching (existing logic)
      if (readmePages && this.isFileMappedByTitle(fileInfo, readmePages)) {
        continue // File is mapped by title
      }

      // If not used by any ReadMe page, it's truly unmapped
      unmappedFiles.set(fileName, fileInfo)
    }

    return unmappedFiles
  }

  private isFileMappedByTitle(localFile: LocalFileInfo, readmePages: ReadMePage[]): boolean {
    const normalizeTitle = (title: string) => title.toLowerCase().trim().replace(/\s+/g, ' ')

    const normalizedLocalTitle = normalizeTitle(localFile.title)

    for (const readmePage of readmePages) {
      const normalizedReadmeTitle = normalizeTitle(readmePage.title)
      if (normalizedLocalTitle === normalizedReadmeTitle) {
        return true
      }
    }

    return false
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

      // Use enhanced matching: title first, then slug
      const localPath = fileSystemHandler.findLocalPathByTitleOrSlug(
        page.title,
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

  /**
   * Extracts parent path from local file path
   */
  private getParentPathFromLocalPath(localPath: string): string | null {
    const pathParts = localPath.split('/')
    if (pathParts.length > 2 && pathParts[0] === 'docs') {
      return pathParts[1] || null
    }
    return null
  }

  /**
   * Capitalizes the first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Extracts filename from local file path
   */
  private getFileNameFromPath(localPath: string): string {
    const pathParts = localPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    return fileName ? fileName.replace('.md', '') : ''
  }

  /**
   * Groups pages by their parent folder
   */
  private groupPagesByFolder(newPages: NewPageInfo[]): Map<string, NewPageInfo[]> {
    const pagesByFolder = new Map<string, NewPageInfo[]>()

    for (const pageInfo of newPages) {
      const parentPath = this.getParentPathFromLocalPath(pageInfo.page.localPath || '')
      const folder = parentPath || 'root'

      if (!pagesByFolder.has(folder)) {
        pagesByFolder.set(folder, [])
      }
      pagesByFolder.get(folder)!.push(pageInfo)
    }

    return pagesByFolder
  }

  /**
   * Creates parent pages and establishes parent-child relationships
   */
  private createParentPagesAndRelationships(pagesByFolder: Map<string, NewPageInfo[]>): {
    parentPages: ProcessedPage[]
    childPages: ProcessedPage[]
  } {
    const parentPages: ProcessedPage[] = []
    const childPages: ProcessedPage[] = []

    for (const [folder, pages] of pagesByFolder) {
      if (folder === 'root') {
        // Root level pages
        childPages.push(...pages.map(p => p.page))
        continue
      }

      // Find the parent page (file with same name as folder)
      const parentPageInfo = pages.find(p => {
        const fileName = this.getFileNameFromPath(p.page.localPath || '')
        return fileName === folder
      })

      if (parentPageInfo) {
        // Use existing page as parent
        const parentPage: ProcessedPage = {
          ...parentPageInfo.page,
          slug: folder,
          children: [],
        }
        parentPages.push(parentPage)

        // Add other pages as children
        for (const pageInfo of pages) {
          if (pageInfo !== parentPageInfo) {
            parentPage.children.push(pageInfo.page)
          }
        }
      } else {
        // Create new parent page
        const parentPage: ProcessedPage = {
          id: null,
          title: this.capitalizeFirstLetter(folder),
          slug: folder,
          order: DEFAULT_ORDER,
          hidden: false,
          localPath: `docs/${folder}/${folder}.md`,
          isNew: true,
          children: pages.map(p => p.page),
        }
        parentPages.push(parentPage)
      }
    }

    return { parentPages, childPages }
  }

  /**
   * Checks if a page is a parent page
   */
  private isParentPage(page: ProcessedPage): boolean {
    const parentPath = this.getParentPathFromLocalPath(page.localPath || '')
    const fileName = this.getFileNameFromPath(page.localPath || '')
    return parentPath !== null && fileName === parentPath
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
