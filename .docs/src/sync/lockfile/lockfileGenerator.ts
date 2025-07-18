/* eslint-disable no-console */
import * as yaml from 'js-yaml'
import { config } from 'dotenv'
import type { LockfileData, ReadMeCategory, ReadMePage, ProcessedPage } from '../../shared/types'
import { ReadMeApiClient, createConsoleProgressReporter } from './readmeApiClient'
import { FileSystemHandler, type LocalFileInfo } from './fileSystemHandler'
import { DocumentTreeBuilder, TreeRenderer } from './documentTreeBuilder'

// Load environment variables
config()

interface ProcessingContext {
  targetCategory: ReadMeCategory
  hierarchicalPages: ReadMePage[]
  allReadMePages: Map<string, ReadMePage>
  localFiles: Map<string, LocalFileInfo>
  unmappedFiles: Map<string, LocalFileInfo>
}

class CategoryNotFoundError extends Error {
  constructor(categorySlug: string) {
    super(`Category '${categorySlug}' not found in ReadMe`)
    this.name = 'CategoryNotFoundError'
  }
}

class MissingApiKeyError extends Error {
  constructor() {
    super('README_API_KEY environment variable is required')
    this.name = 'MissingApiKeyError'
  }
}

export class LockfileGenerator {
  private readonly apiClient: ReadMeApiClient
  private readonly fileSystemHandler: FileSystemHandler
  private readonly documentTreeBuilder: DocumentTreeBuilder
  private readonly startTime: number

  constructor(
    apiClient?: ReadMeApiClient,
    fileSystemHandler?: FileSystemHandler,
    documentTreeBuilder?: DocumentTreeBuilder,
  ) {
    this.apiClient = apiClient ?? this.createApiClient()
    this.fileSystemHandler = fileSystemHandler ?? new FileSystemHandler()
    this.documentTreeBuilder = documentTreeBuilder ?? new DocumentTreeBuilder()
    this.startTime = Date.now()
  }

  private createApiClient(): ReadMeApiClient {
    const apiKey = process.env.README_API_KEY
    if (!apiKey) {
      throw new MissingApiKeyError()
    }
    return new ReadMeApiClient(apiKey)
  }

  // Main public workflow
  async generateLockfile(): Promise<LockfileData> {
    console.log('Generating docs lockfile from ReadMe API...')

    try {
      const context = await this.gatherProcessingContext()
      const documentTree = this.buildDocumentTree(context)

      // Report deleted files after building document tree
      this.logDeletedFiles(documentTree)

      return this.createResult(context, documentTree)
    } catch (error) {
      console.error('Lockfile generation failed:', (error as Error).message)
      throw error
    }
  }

  // Core workflow steps (in execution order)
  private async gatherProcessingContext(): Promise<ProcessingContext> {
    const targetCategory = await this.findTargetCategory()
    const hierarchicalPages = await this.apiClient.getCategoryPages(targetCategory.slug)

    console.log(
      `ReadMe returned ${hierarchicalPages.length} top-level pages with complete hierarchy`,
    )

    const allReadMePages = ReadMeApiClient.extractAllPages(hierarchicalPages)
    console.log(`Found ${allReadMePages.size} total pages from ReadMe hierarchy`)

    const checkUpdateStatus = process.env.DOCS_CHECK_UPDATE_STATUS !== 'false'
    if (checkUpdateStatus) {
      await this.apiClient.fetchAllPageDetails(allReadMePages, createConsoleProgressReporter())
    }

    const localFiles = this.fileSystemHandler.scanLocalFiles()
    console.log(`Found ${localFiles.size} local markdown files`)

    const readmePageSlugs = new Set(allReadMePages.keys())
    const allReadMePagesArray = Array.from(allReadMePages.values())
    const unmappedFiles = this.documentTreeBuilder.findUnmappedFiles(
      readmePageSlugs,
      localFiles,
      allReadMePagesArray,
    )

    this.logUnmappedFiles(unmappedFiles)

    return {
      targetCategory,
      hierarchicalPages,
      allReadMePages,
      localFiles,
      unmappedFiles,
    }
  }

  private async findTargetCategory(): Promise<ReadMeCategory> {
    const categories = await this.apiClient.getCategories()
    const targetCategory = categories.find(cat => cat.slug === 'react-sdk')

    if (!targetCategory) {
      throw new CategoryNotFoundError('react-sdk')
    }

    console.log(`Found react-sdk category: ${targetCategory.title}`)
    return targetCategory
  }

  private buildDocumentTree(context: ProcessingContext): ProcessedPage[] {
    const checkUpdateStatus = process.env.DOCS_CHECK_UPDATE_STATUS !== 'false'
    const documentTree = this.documentTreeBuilder.buildDocumentTree(
      context.hierarchicalPages,
      context.localFiles,
      this.fileSystemHandler,
      checkUpdateStatus ? context.allReadMePages : undefined,
    )

    return this.documentTreeBuilder.integrateUnmappedFiles(documentTree, context.unmappedFiles)
  }

  // Create the final result
  private createResult(context: ProcessingContext, documentTree: ProcessedPage[]): LockfileData {
    const endTime = Date.now()
    const executionTimeMs = endTime - this.startTime

    return {
      // Use stable timestamp based on content, not current time
      timestamp: this.createStableTimestamp(context.hierarchicalPages),
      targetCategory: context.targetCategory.slug,
      totalCategories: 1,
      totalPages: documentTree.length,
      pagesWithChildren: documentTree.filter(page => page.children.length > 0).length,
      categories: [
        {
          id: context.targetCategory.id || context.targetCategory._id || '',
          title: context.targetCategory.title,
          slug: context.targetCategory.slug,
          order: context.targetCategory.order,
          totalPages: context.hierarchicalPages.length,
          structure: documentTree,
        },
      ],
      metadata: {
        apiRequestCount: context.allReadMePages.size,
        discoveredRelationships: context.unmappedFiles.size,
        hierarchicalRelationships: documentTree.filter(p => p.children.length > 0).length,
        executionTimeMs,
      },
    }
  }

  // Create a stable timestamp based on content hash rather than current time
  private createStableTimestamp(pages: ReadMePage[]): string {
    // Create a content signature from page data that changes only when content changes
    const contentSignature = pages
      .map(
        page =>
          `${page.id || page._id || ''}-${page.title}-${page.updatedAt || ''}-${page.revision || 0}`,
      )
      .sort()
      .join('|')

    // Use a stable date based on content hash
    // This will only change when the actual content changes, not on every run
    const hash = contentSignature.length.toString(36) // Simple hash based on length
    const stableDate = new Date('2024-01-01T00:00:00.000Z')
    stableDate.setSeconds(parseInt(hash, 36) % 60)

    return stableDate.toISOString()
  }

  // Output/utility methods (separate concern)
  saveResult(result: LockfileData): void {
    const outputPath = `.docs/docs-lock.yml`

    this.fileSystemHandler.ensureDirectory('.docs')

    const yamlContent = yaml.dump(result, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    })

    this.fileSystemHandler.writeYamlFile(outputPath, yamlContent)
    console.log(`✓ Saved docs-lock.yml (${result.totalPages} pages)`)
  }

  printSummary(result: LockfileData): void {
    const formattedSummary = TreeRenderer.formatTreeSummary(result)
    console.log(formattedSummary)
  }

  private logUnmappedFiles(unmappedFiles: Map<string, LocalFileInfo>): void {
    console.log(`Found ${unmappedFiles.size} new local files not in ReadMe`)
    unmappedFiles.forEach((page: LocalFileInfo) => {
      console.log(`  New page: ${page.title} (${page.localPath})`)
    })
  }

  private logDeletedFiles(documentTree: ProcessedPage[]): void {
    const deletedFiles = this.findDeletedFiles(documentTree)
    if (deletedFiles.length > 0) {
      console.log(`Found ${deletedFiles.length} deleted files (exist in ReadMe but not locally)`)
      deletedFiles.forEach((page: ProcessedPage) => {
        console.log(`  Deleted page: ${page.title} (${page.slug})`)
      })
    }
  }

  private findDeletedFiles(pages: ProcessedPage[]): ProcessedPage[] {
    const deletedFiles: ProcessedPage[] = []

    for (const page of pages) {
      if (page.isDeleted) {
        deletedFiles.push(page)
      }
      // Recursively check children
      if (page.children.length > 0) {
        deletedFiles.push(...this.findDeletedFiles(page.children))
      }
    }

    return deletedFiles
  }
}

// Main execution - only run when file is executed directly, not imported
async function main(): Promise<void> {
  try {
    const generator = new LockfileGenerator()

    const result = await generator.generateLockfile()
    generator.saveResult(result)
    generator.printSummary(result)

    console.log('Lockfile generation completed successfully!')
  } catch (error) {
    console.error('Generation failed:', (error as Error).message)
    process.exit(1)
  }
}

// Only execute if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
