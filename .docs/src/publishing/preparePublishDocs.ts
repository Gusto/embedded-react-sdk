/* eslint-disable no-console */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { execSync } from 'child_process'
import * as yaml from 'js-yaml'
import { LockFileReader, type PageWithParent } from '../frontmatter/lockfileReader'

interface PublishPrepResult {
  totalFiles: number
  filesProcessed: number
  errors: string[]
}

interface ParsedMarkdown {
  frontmatter: Record<string, unknown> | null
  content: string
}

export class PublishDocsPreparator {
  private readonly lockFileReader: LockFileReader
  private readonly sourceDir = 'docs'
  private readonly tempDir = '.docs/temp-publish-docs'

  constructor() {
    this.lockFileReader = new LockFileReader()
  }

  preparePublishDocs(): PublishPrepResult {
    console.log('Preparing documentation for publishing...')

    const result: PublishPrepResult = {
      totalFiles: 0,
      filesProcessed: 0,
      errors: [],
    }

    try {
      // Clean and create temp directory
      this.cleanTempDir()

      // Read lock file to get ID mappings
      const lockData = this.lockFileReader.readLockFile('.docs/docs-lock.yml')
      const pagesWithParents = this.lockFileReader.extractAllPagesWithParents(lockData)

      // Create lookup map for faster access
      const pathToPageMap = new Map<string, PageWithParent>()
      pagesWithParents.forEach(pageWithParent => {
        if (pageWithParent.page.localPath) {
          pathToPageMap.set(pageWithParent.page.localPath, pageWithParent)
        }
      })

      // Find all markdown files
      const markdownFiles = this.findMarkdownFiles(this.sourceDir)
      result.totalFiles = markdownFiles.length

      console.log(`Found ${markdownFiles.length} markdown files to process`)

      // Process each file
      for (const filePath of markdownFiles) {
        try {
          const relativeFilePath = filePath.replace(/^docs\//, 'docs/')
          const pageWithParent = pathToPageMap.get(relativeFilePath)

          if (pageWithParent) {
            this.processFileWithIds(filePath, pageWithParent)
            result.filesProcessed++
          } else {
            // Copy file without ID modifications (for files not in lock)
            this.copyFileWithoutModification(filePath)
            result.filesProcessed++
            console.warn(`⚠️  File not found in lock file: ${filePath}`)
          }
        } catch (error) {
          const errorMsg = `Failed to process ${filePath}: ${(error as Error).message}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      console.log(`\n✅ Successfully prepared ${result.filesProcessed}/${result.totalFiles} files`)
      console.log(`📁 Published docs ready in: ${this.tempDir}`)

      if (result.errors.length > 0) {
        console.log(`\n❌ Errors encountered: ${result.errors.length}`)
        result.errors.forEach(error => {
          console.error(`   ${error}`)
        })
      }
    } catch (error) {
      throw new Error(`Publish preparation failed: ${(error as Error).message}`)
    }

    return result
  }

  private findMarkdownFiles(dir: string): string[] {
    const files: string[] = []

    try {
      const entries = readdirSync(dir)

      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          files.push(...this.findMarkdownFiles(fullPath))
        } else if (entry.endsWith('.md')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${(error as Error).message}`)
    }

    return files
  }

  private cleanTempDir(): void {
    // Remove and recreate temp directory
    try {
      const rmCommand = process.platform === 'win32' ? 'rmdir /s /q' : 'rm -rf'
      execSync(`${rmCommand} ${this.tempDir}`, { stdio: 'ignore' })
    } catch (error) {
      // Directory might not exist, that's okay
    }

    mkdirSync(this.tempDir, { recursive: true })
  }

  private processFileWithIds(sourceFilePath: string, pageWithParent: PageWithParent): void {
    const destFilePath = sourceFilePath.replace(this.sourceDir, this.tempDir)

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

  private copyFileWithoutModification(sourceFilePath: string): void {
    const destFilePath = sourceFilePath.replace(this.sourceDir, this.tempDir)

    // Ensure destination directory exists
    mkdirSync(dirname(destFilePath), { recursive: true })

    // Copy file as-is
    copyFileSync(sourceFilePath, destFilePath)
  }

  private parseMarkdownFile(content: string): ParsedMarkdown {
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

    // Add required publishing fields
    frontmatter.title = page.title
    frontmatter.category = '6849ddd92905ee0053320687' // From your processor
    frontmatter.slug = page.slug || this.generateSlugFromTitle(page.title)
    frontmatter.hidden = page.hidden || false

    // Add parentDoc if it exists
    if (parentId) {
      frontmatter.parentDoc = parentId
    }

    // Add order if it exists
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
}

// Main execution
function main(): void {
  try {
    const preparator = new PublishDocsPreparator()
    const result = preparator.preparePublishDocs()

    if (result.errors.length > 0) {
      console.error('\n❌ Preparation completed with errors')
      process.exit(1)
    }

    console.log('\n✅ Documentation preparation completed successfully!')
  } catch (error) {
    console.error('❌ Preparation failed:', (error as Error).message)
    process.exit(1)
  }
}

// Only run main() when not in test environment
if (!process.env.VITEST) {
  main()
}
