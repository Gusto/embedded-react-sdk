/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import * as yaml from 'js-yaml'
import { config } from 'dotenv'
import type { LockfileData } from '../shared/types'
import { ReadMeApiClient, createConsoleProgressReporter } from './readmeApiClient'
import { FileSystemHandler, FileWriter, type LocalFileInfo } from './fileSystemHandler'
import { DocumentTreeBuilder, TreeRenderer } from './documentTreeBuilder'

// Load environment variables
config()

interface ProcessingContext {
  targetCategory: any
  hierarchicalPages: any[]
  allReadMePages: Map<string, any>
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

  async generateLockfile(): Promise<LockfileData> {
    console.log('Generating docs lockfile from ReadMe API...')

    try {
      const context = await this.gatherProcessingContext()
      const documentTree = this.buildDocumentTree(context)

      return this.createResult(context, documentTree)
    } catch (error) {
      console.error('Lockfile generation failed:', (error as Error).message)
      throw error
    }
  }

  saveResult(result: LockfileData): void {
    const outputPath = `.docs/docs-lock.yml`

    FileWriter.ensureDirectory('.docs')

    const yamlContent = yaml.dump(result, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    })

    FileWriter.writeYamlFile(outputPath, yamlContent)
    console.log(`✓ Saved docs-lock.yml (${result.totalPages} pages)`)
  }

  printSummary(result: LockfileData): void {
    const formattedSummary = TreeRenderer.formatTreeSummary(result)
    console.log(formattedSummary)
  }

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
    const unmappedFiles = this.documentTreeBuilder.findUnmappedFiles(readmePageSlugs, localFiles)

    this.logUnmappedFiles(unmappedFiles)

    return {
      targetCategory,
      hierarchicalPages,
      allReadMePages,
      localFiles,
      unmappedFiles,
    }
  }

  private async findTargetCategory() {
    const categories = await this.apiClient.getCategories()
    const targetCategory = categories.find(cat => cat.slug === 'react-sdk')

    if (!targetCategory) {
      throw new CategoryNotFoundError('react-sdk')
    }

    console.log(`Found react-sdk category: ${targetCategory.title}`)
    return targetCategory
  }

  private buildDocumentTree(context: ProcessingContext) {
    const checkUpdateStatus = process.env.DOCS_CHECK_UPDATE_STATUS !== 'false'
    const documentTree = this.documentTreeBuilder.buildDocumentTree(
      context.hierarchicalPages,
      context.localFiles,
      this.fileSystemHandler,
      checkUpdateStatus ? context.allReadMePages : undefined,
    )

    return this.documentTreeBuilder.integrateUnmappedFiles(documentTree, context.unmappedFiles)
  }

  private createResult(context: ProcessingContext, documentTree: any[]): LockfileData {
    return this.documentTreeBuilder.createProcessingResult(
      context.targetCategory,
      documentTree,
      context.allReadMePages.size + context.unmappedFiles.size,
      this.apiClient.getRequestCount(),
      this.startTime,
    )
  }

  private logUnmappedFiles(unmappedFiles: Map<string, LocalFileInfo>): void {
    console.log(`Found ${unmappedFiles.size} new local files not in ReadMe`)
    unmappedFiles.forEach((page: LocalFileInfo) => {
      console.log(`  New page: ${page.title} (${page.localPath})`)
    })
  }

  private createApiClient(): ReadMeApiClient {
    const apiKey = process.env.README_API_KEY
    if (!apiKey) {
      throw new MissingApiKeyError()
    }
    return new ReadMeApiClient(apiKey)
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
