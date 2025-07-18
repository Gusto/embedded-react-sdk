/* eslint-disable no-console */
import { writeFileSync, readFileSync, mkdirSync, watchFile, unwatchFile } from 'fs'
import { join, dirname } from 'path'
import * as yaml from 'js-yaml'
import { LockFileReader, type PageWithParent } from '../sync/frontmatter/lockfileReader'

interface PreviewResult {
  totalFiles: number
  processedFiles: number
  errors: string[]
  outputPath: string
}

interface PreviewOptions {
  watch?: boolean
}

export class PreviewGenerator {
  private readonly lockFileReader: LockFileReader
  private readonly outputBaseDir: string = '.docs/temp-publish-docs'
  private isWatching: boolean = false
  private watchedFiles: Set<string> = new Set()

  constructor() {
    this.lockFileReader = new LockFileReader()
  }

  generatePreview(options: PreviewOptions = {}): PreviewResult {
    console.log('Preparing documentation for publishing...')

    const result = this.runGeneration()

    if (options.watch && !this.isWatching) {
      this.startWatchMode()
    }

    return result
  }

  private runGeneration(): PreviewResult {
    try {
      // Read the lock file to get all pages
      const lockData = this.lockFileReader.readLockFile('.docs/docs-lock.yml')
      const allPagesWithParents = this.lockFileReader.extractAllPagesWithParents(lockData)

      // Filter to only pages that have local paths
      const pagesWithFiles = allPagesWithParents.filter(item => item.page.localPath)
      console.log(`Found ${pagesWithFiles.length} markdown files to process`)

      const result: PreviewResult = {
        totalFiles: pagesWithFiles.length,
        processedFiles: 0,
        errors: [],
        outputPath: '',
      }

      // Set up output directory
      const categorySlug = lockData.targetCategory
      const outputDir = join(this.outputBaseDir, categorySlug)
      result.outputPath = outputDir

      // Ensure output directory exists
      this.ensureDirectoryExists(outputDir)

      // Process each file
      for (const pageWithParent of pagesWithFiles) {
        try {
          this.processFileForPreview(pageWithParent, outputDir)
          result.processedFiles++
        } catch (error) {
          const errorMsg = `Failed to process ${pageWithParent.page.localPath}: ${(error as Error).message}`
          result.errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }

      console.log(`\n✅ Successfully prepared ${result.processedFiles}/${result.totalFiles} files`)
      console.log(`📁 Published docs ready in: ${outputDir}`)

      if (result.errors.length > 0) {
        console.log(`\n⚠️  ${result.errors.length} files had errors`)
      }

      console.log('\n✅ Documentation preparation completed successfully!')
      return result
    } catch (error) {
      console.error('❌ Preview generation failed:', (error as Error).message)
      throw error
    }
  }

  private ensureDirectoryExists(dir: string): void {
    try {
      mkdirSync(dir, { recursive: true })
    } catch (error) {
      console.error(`Error creating directory ${dir}: ${(error as Error).message}`)
      process.exit(1)
    }
  }

  private processFileForPreview(pageWithParent: PageWithParent, outputDir: string): void {
    const sourceFilePath = pageWithParent.page.localPath
    if (!sourceFilePath) {
      throw new Error(`No local path for page: ${pageWithParent.page.title}`)
    }

    // Preserve directory structure relative to docs/ folder
    const relativePath = sourceFilePath.replace(/^docs\//, '')
    const destFilePath = join(outputDir, relativePath)

    // Ensure destination directory exists
    mkdirSync(dirname(destFilePath), { recursive: true })

    // Read source file
    const content = readFileSync(sourceFilePath, 'utf-8')

    // Parse existing frontmatter or create new
    const parsed = this.parseMarkdownFile(content)
    const frontmatter = this.createFrontmatterWithIds(
      pageWithParent,
      parsed.frontmatter || undefined,
    )

    // Write file with updated frontmatter
    const yamlFrontmatter = yaml.dump(frontmatter, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    })

    const newContent = `---\n${yamlFrontmatter}---\n${parsed.content}`
    writeFileSync(destFilePath, newContent, 'utf-8')
  }

  private parseMarkdownFile(content: string): {
    frontmatter: Record<string, unknown> | null
    content: string
  } {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

    if (!frontmatterMatch || !frontmatterMatch[1] || !frontmatterMatch[2]) {
      return {
        frontmatter: null,
        content: content,
      }
    }

    try {
      const frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown>
      return {
        frontmatter,
        content: frontmatterMatch[2],
      }
    } catch (error) {
      console.warn(
        `Warning: Could not parse frontmatter, proceeding without: ${(error as Error).message}`,
      )
      return {
        frontmatter: null,
        content: content,
      }
    }
  }

  private createFrontmatterWithIds(
    pageWithParent: PageWithParent,
    existingFrontmatter?: Record<string, unknown>,
  ): Record<string, unknown> {
    const { page, parentId } = pageWithParent

    // Start with existing frontmatter or empty object
    const frontmatter = existingFrontmatter ? { ...existingFrontmatter } : {}

    // Add required ReadMe Classic publishing fields (rdme@9 format)
    frontmatter.id = page.id
    frontmatter.title = page.title
    frontmatter.category = '6849ddd92905ee0053320687' // React SDK category ID
    frontmatter.slug = page.slug || this.generateSlugFromTitle(page.title)

    // Only add hidden if it's actually true, otherwise remove it
    if (page.hidden) {
      frontmatter.hidden = page.hidden
    } else {
      delete frontmatter.hidden
    }

    // Add parentDoc if it exists (ReadMe Classic uses parentDoc with ID)
    if (parentId) {
      frontmatter.parentDoc = parentId
    }

    // Always add order for ReadMe publishing (even if 999)
    if (typeof page.order === 'number') {
      frontmatter.order = page.order
    }

    return frontmatter
  }

  private generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  private startWatchMode(): void {
    this.isWatching = true
    console.log('\n👀 Watch mode enabled - monitoring for changes...')
    console.log('Press Ctrl+C to stop watching\n')

    try {
      // Read the lock file to get all pages with local paths
      const lockData = this.lockFileReader.readLockFile('.docs/docs-lock.yml')
      const allPagesWithParents = this.lockFileReader.extractAllPagesWithParents(lockData)
      const pagesWithFiles = allPagesWithParents.filter(item => item.page.localPath)

      // Watch each markdown file
      for (const pageWithParent of pagesWithFiles) {
        const filePath = pageWithParent.page.localPath!
        this.watchedFiles.add(filePath)

        watchFile(filePath, { interval: 1000 }, (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            console.log(`\n📝 File changed: ${filePath}`)
            console.log('🔄 Regenerating docs...')
            try {
              this.runGeneration()
              console.log('👀 Watching for changes...\n')
            } catch (error) {
              console.error('❌ Error regenerating docs:', (error as Error).message)
            }
          }
        })
      }

      // Also watch the lock file for structural changes
      const lockFilePath = '.docs/docs-lock.yml'
      watchFile(lockFilePath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          console.log(`\n📋 Lock file changed: ${lockFilePath}`)
          console.log('🔄 Restarting watch with new structure...')
          this.restartWatch()
        }
      })
    } catch (error) {
      console.error('❌ Failed to start watch mode:', (error as Error).message)
      this.stopWatch()
    }

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\n\n👋 Stopping watch mode...')
      this.stopWatch()
      process.exit(0)
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
  }

  private restartWatch(): void {
    this.stopWatch()
    this.isWatching = false
    this.startWatchMode()
  }

  private stopWatch(): void {
    Array.from(this.watchedFiles).forEach(filePath => {
      unwatchFile(filePath)
    })
    unwatchFile('.docs/docs-lock.yml')
    this.watchedFiles.clear()
    this.isWatching = false
  }
}

// Main execution
function main(): void {
  try {
    const generator = new PreviewGenerator()

    // Parse command line arguments
    const args = process.argv.slice(2)
    const watchMode = args.includes('--watch') || args.includes('-w')

    if (watchMode) {
      console.log('🚀 Starting documentation preview in watch mode...')
    }

    const result = generator.generatePreview({ watch: watchMode })

    if (result.errors.length > 0) {
      console.error('\n❌ Preview generation completed with errors')
      if (!watchMode) {
        process.exit(1)
      }
    }

    if (!watchMode) {
      console.log('\n✅ Documentation preview completed successfully!')
      console.log('\n💡 Tip: Use --watch or -w flag to enable watch mode for development')
    }
  } catch (error) {
    console.error('❌ Preview generation failed:', (error as Error).message)
    process.exit(1)
  }
}

// Only run main() when not in test environment
if (!process.env.VITEST) {
  main()
}
