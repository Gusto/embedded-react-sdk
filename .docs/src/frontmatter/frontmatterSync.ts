/* eslint-disable no-console */
import { FrontmatterProcessor } from './frontmatterProcessor'
import { LockFileReader, type PageWithParent } from './lockfileReader'

interface SyncResult {
  totalFiles: number
  filesAdded: number
  filesUpdated: number
  filesSkipped: number
  errors: number
}

export class FrontmatterSync {
  private readonly processor: FrontmatterProcessor
  private readonly lockFileReader: LockFileReader

  constructor() {
    this.processor = new FrontmatterProcessor()
    this.lockFileReader = new LockFileReader()
  }

  syncAllFiles(): SyncResult {
    console.log('Syncing frontmatter from docs-lock.yml...')

    try {
      const lockData = this.lockFileReader.readLockFile('.docs/docs-lock.yml')
      const allPagesWithParents = this.lockFileReader.extractAllPagesWithParents(lockData)

      console.log(`Found ${allPagesWithParents.length} pages in lock file`)

      return this.processAllPages(allPagesWithParents)
    } catch (error) {
      console.error('Frontmatter sync failed:', (error as Error).message)
      throw error
    }
  }

  private processAllPages(pagesWithParents: PageWithParent[]): SyncResult {
    const result: SyncResult = {
      totalFiles: 0,
      filesAdded: 0,
      filesUpdated: 0,
      filesSkipped: 0,
      errors: 0,
    }

    const pagesWithLocalPath = pagesWithParents.filter(item => item.page.localPath)
    result.totalFiles = pagesWithLocalPath.length

    for (let i = 0; i < pagesWithLocalPath.length; i++) {
      const pageWithParent = pagesWithLocalPath[i]
      if (!pageWithParent) continue

      const { page, parentId } = pageWithParent
      const progress = Math.round(((i + 1) / pagesWithLocalPath.length) * 100)

      process.stdout.write(
        `\rProcessing files... ${i + 1}/${pagesWithLocalPath.length} (${progress}%)`,
      )

      try {
        const action = this.processor.processFile(page, parentId)

        switch (action) {
          case 'added':
            result.filesAdded++
            break
          case 'updated':
            result.filesUpdated++
            break
          case 'skipped':
            result.filesSkipped++
            break
        }
      } catch (error) {
        result.errors++
      }
    }

    process.stdout.write('\r')
    return result
  }

  printSummary(result: SyncResult): void {
    console.log(`✓ Processed ${result.totalFiles} files`)
    console.log(`  Added frontmatter: ${result.filesAdded}`)
    console.log(`  Updated frontmatter: ${result.filesUpdated}`)
    console.log(`  Skipped (no changes): ${result.filesSkipped}`)

    if (result.errors > 0) {
      console.log(`  Errors: ${result.errors}`)
    }
  }
}

function main(): void {
  try {
    const sync = new FrontmatterSync()

    const result = sync.syncAllFiles()
    sync.printSummary(result)

    console.log('Frontmatter sync completed successfully!')
  } catch (error) {
    console.error('Sync failed:', (error as Error).message)
    process.exit(1)
  }
}

// Only run main() when not in test environment
if (!process.env.VITEST) {
  main()
}
