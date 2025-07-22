/* eslint-disable no-console */
import type { ProcessedPage } from '../shared/types'
import { LockfileGenerator } from './lockfile/lockfileGenerator'
import { FrontmatterSync } from './frontmatter/frontmatterSync'

interface SyncResult {
  lockfile: {
    totalPages: number
    newFiles: number
    errors: number
  }
  frontmatter: {
    totalFiles: number
    filesAdded: number
    filesUpdated: number
    filesSkipped: number
    errors: number
  }
}

export class SyncManager {
  private readonly lockfileGenerator: LockfileGenerator
  private readonly frontmatterSync: FrontmatterSync

  constructor() {
    this.lockfileGenerator = new LockfileGenerator()
    this.frontmatterSync = new FrontmatterSync()
  }

  async syncFromReadme(): Promise<SyncResult> {
    console.log('🔄 Syncing documentation from ReadMe...')
    console.log('   Step 1: Reading ReadMe API and updating lockfile')
    console.log('   Step 2: Syncing frontmatter to local files')

    try {
      // Step 1: Generate lockfile from ReadMe API
      const lockfileResult = await this.lockfileGenerator.generateLockfile()
      this.lockfileGenerator.saveResult(lockfileResult)

      const allPages = lockfileResult.categories.flatMap(cat => this.extractAllPages(cat.structure))
      const newFiles = allPages.filter(page => page.isNew).length
      const totalPages = allPages.length

      console.log(`✅ Step 1 complete: Updated lockfile (${totalPages} pages, ${newFiles} new)`)

      // Step 2: Sync frontmatter based on updated lockfile
      const frontmatterResult = this.frontmatterSync.syncAllFiles()

      console.log(`✅ Step 2 complete: Synced frontmatter`)

      const result: SyncResult = {
        lockfile: {
          totalPages,
          newFiles,
          errors: 0, // LockfileGenerator throws on errors
        },
        frontmatter: frontmatterResult,
      }

      this.printSummary(result)
      return result
    } catch (error) {
      console.error('❌ Sync failed:', (error as Error).message)
      throw error
    }
  }

  private extractAllPages(pages: ProcessedPage[]): ProcessedPage[] {
    const allPages: ProcessedPage[] = []
    for (const page of pages) {
      allPages.push(page)
      if (page.children.length > 0) {
        allPages.push(...this.extractAllPages(page.children))
      }
    }
    return allPages
  }

  private printSummary(result: SyncResult): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(50))

    console.log(`📥 ReadMe Sync:`)
    console.log(`   Total pages: ${result.lockfile.totalPages}`)
    console.log(`   New files: ${result.lockfile.newFiles}`)

    console.log(`📝 Frontmatter Sync:`)
    console.log(`   Total files: ${result.frontmatter.totalFiles}`)
    console.log(`   Added frontmatter: ${result.frontmatter.filesAdded}`)
    console.log(`   Updated frontmatter: ${result.frontmatter.filesUpdated}`)
    console.log(`   Skipped (no changes): ${result.frontmatter.filesSkipped}`)

    if (result.frontmatter.errors > 0) {
      console.log(`   Errors: ${result.frontmatter.errors}`)
    }

    console.log('='.repeat(50))
    console.log('✅ Sync completed successfully!')
    console.log('   Your local files are now in sync with ReadMe')
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    const syncManager = new SyncManager()
    await syncManager.syncFromReadme()
  } catch (error) {
    console.error('Sync failed:', (error as Error).message)
    process.exit(1)
  }
}

// Run if called directly
if (!process.env.VITEST) {
  void main()
}
