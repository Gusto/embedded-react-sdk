/* eslint-disable no-console */
import { readFileSync } from 'fs'
import { Buffer } from 'buffer'
import { createInterface } from 'readline'
import { config } from 'dotenv'
import { LockFileReader } from '../sync/frontmatter/lockfileReader'
import { PreviewGenerator } from '../preview/previewGenerator'
import type { ProcessedPage } from '../shared/types'

// Load environment variables
config()

interface PublishResult {
  newPages: PublishPageResult[]
  updatedPages: PublishPageResult[]
  skippedPages: PublishPageResult[]
  errors: PublishError[]
  totalProcessed: number
  totalSkipped: number
}

interface PublishPageResult {
  slug: string
  title: string
  id?: string
  status: 'success' | 'error' | 'skipped'
  action: 'created' | 'updated' | 'skipped'
  message?: string
}

interface PublishError {
  slug: string
  title: string
  error: string
  action: 'create' | 'update'
}

export interface PageWithParent {
  page: ProcessedPage
  parentDoc?: string
  parentSlug?: string
  categoryId: string
}

export class ReadmePublisher {
  private readonly apiKey: string
  private readonly lockFileReader: LockFileReader
  private readonly previewGenerator: PreviewGenerator
  private readonly rl?: ReturnType<typeof createInterface>
  private categorySlug?: string
  private readonly API_DELAY_MS = 150 // Rate limiting: 150ms between API calls

  constructor(apiKey: string, interactive = false) {
    this.apiKey = apiKey
    this.lockFileReader = new LockFileReader()
    this.previewGenerator = new PreviewGenerator()

    if (interactive) {
      this.rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      })
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private log(
    level: 'info' | 'success' | 'warning' | 'error',
    message: string,
    indent: boolean = false,
  ): void {
    const prefix = indent ? '   ' : ''
    const emoji = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[level]

    console.log(`${prefix}${emoji} ${message}`)
  }

  private logMode(dryRun: boolean, interactive: boolean): void {
    if (dryRun && interactive) {
      this.log('info', 'DRY RUN INTERACTIVE MODE: Step through each page safely')
      this.log('warning', 'No actual changes will be made to ReadMe', true)
    } else if (dryRun) {
      this.log('info', 'DRY RUN: Simulating documentation publishing to ReadMe')
      this.log('warning', 'No actual changes will be made to ReadMe', true)
    } else if (interactive) {
      this.log('info', 'INTERACTIVE MODE: Step through each page for publishing')
      this.log('info', 'You can review and choose what to publish', true)
    } else {
      this.log('info', 'LIVE PUBLISH: Publishing documentation to ReadMe')
      this.log('warning', 'LIVE MODE - Changes will be made to ReadMe!', true)
    }
  }

  async publishDocs(dryRun: boolean = false, interactive: boolean = false): Promise<PublishResult> {
    this.logMode(dryRun, interactive)

    const result: PublishResult = {
      newPages: [],
      updatedPages: [],
      skippedPages: [],
      errors: [],
      totalProcessed: 0,
      totalSkipped: 0,
    }

    try {
      // 1. Prepare docs with frontmatter and IDs
      this.log('info', 'Preparing documentation...')
      const prepareResult = this.previewGenerator.generatePreview()

      if (prepareResult.errors.length > 0) {
        throw new Error(`Failed to prepare docs: ${prepareResult.errors.join(', ')}`)
      }

      // 2. Read lockfile to get page metadata
      const lockData = this.lockFileReader.readLockFile('.docs/docs-lock.yml')
      this.categorySlug = lockData.targetCategory
      const pagesFromLockfile = this.lockFileReader.extractAllPagesWithParents(lockData)

      // 3. Add category IDs to pages (assuming single category for now)
      const categoryId = lockData.categories[0]?.id
      if (!categoryId) {
        throw new Error('No category found in lockfile')
      }

      const pagesWithParents: PageWithParent[] = pagesFromLockfile.map(p => ({
        page: p.page,
        parentDoc: p.parentId, // Rename from parentId to parentDoc
        parentSlug: p.parentSlug,
        categoryId,
      }))

      // 4. Separate new vs existing pages, and filter unchanged existing pages
      const newPages = pagesWithParents.filter(p => p.page.isNew)
      const existingPages = pagesWithParents.filter(p => !p.page.isNew)
      const unchangedPages = existingPages.filter(p => !p.page.isUpdated)
      const changedPages = existingPages.filter(p => p.page.isUpdated)

      this.log(
        'info',
        `Found ${newPages.length} new pages, ${changedPages.length} changed pages, and ${unchangedPages.length} unchanged pages`,
      )

      // 5. Process new pages
      for (const pageWithParent of newPages) {
        try {
          const publishResult = await this.createNewPage(pageWithParent, dryRun, interactive)

          if (publishResult.status === 'skipped') {
            result.skippedPages.push(publishResult)
            result.totalSkipped++
          } else {
            result.newPages.push(publishResult)
            result.totalProcessed++
          }
        } catch (error) {
          result.errors.push({
            slug: pageWithParent.page.slug ?? pageWithParent.page.title,
            title: pageWithParent.page.title,
            error: (error as Error).message,
            action: 'create',
          })
        }
      }

      // 6. Process changed existing pages
      for (const pageWithParent of changedPages) {
        try {
          const publishResult = await this.updateExistingPage(pageWithParent, dryRun, interactive)

          if (publishResult.status === 'skipped') {
            result.skippedPages.push(publishResult)
            result.totalSkipped++
          } else {
            result.updatedPages.push(publishResult)
            result.totalProcessed++
          }
        } catch (error) {
          result.errors.push({
            slug: pageWithParent.page.slug ?? pageWithParent.page.title,
            title: pageWithParent.page.title,
            error: (error as Error).message,
            action: 'update',
          })
        }
      }

      // 7. Skip unchanged pages
      for (const pageWithParent of unchangedPages) {
        result.skippedPages.push({
          slug: pageWithParent.page.slug ?? pageWithParent.page.title,
          title: pageWithParent.page.title,
          id: pageWithParent.page.id ?? undefined,
          status: 'skipped',
          action: 'skipped',
          message: 'No changes detected',
        })
        result.totalSkipped++
      }

      if (dryRun && interactive) {
        this.log('success', 'DRY RUN INTERACTIVE COMPLETE - No changes were made')
      } else if (dryRun) {
        this.log('success', 'DRY RUN COMPLETE - No changes were made')
      } else if (interactive) {
        this.log('success', 'INTERACTIVE MODE COMPLETE - Review summary below')
      } else {
        this.log('success', 'LIVE PUBLISH COMPLETE - Changes have been made to ReadMe!')
      }
      this.printSummary(result, dryRun, interactive)

      return result
    } catch (error) {
      this.log('error', `Publishing failed: ${(error as Error).message}`)
      throw error
    } finally {
      // Always clean up
      this.log('info', 'Cleaning up...')
      if (this.rl) {
        this.rl.close()
      }

      // Clean up temporary publish directory
      try {
        const { execSync } = await import('child_process')
        execSync('rm -rf .docs/temp-publish-docs', { stdio: 'inherit' })
        this.log('success', 'Cleaned up temporary publish directory')
      } catch (error) {
        this.log('warning', `Could not clean up temporary directory: ${(error as Error).message}`)
      }
    }
  }

  private async createNewPage(
    pageWithParent: PageWithParent,
    dryRun: boolean,
    interactive: boolean,
  ): Promise<PublishPageResult> {
    const { page, parentDoc, categoryId } = pageWithParent

    if (dryRun && !interactive) {
      this.log('info', `[DRY RUN] Simulating creation of new page: ${page.title}`)
      return {
        slug: page.slug || page.title,
        title: page.title,
        status: 'success',
        action: 'created',
        message: 'DRY RUN: Would create new page',
      }
    }

    if (interactive) {
      let answer = await this.askUser(`📄 CREATE: ${page.title}`)

      while (answer === 'p') {
        this.showPagePreview(page)
        answer = await this.askUser(`📄 CREATE: ${page.title}`)
      }

      if (answer === 'y') {
        if (dryRun) {
          this.log('info', `[DRY RUN INTERACTIVE] Simulating creation of new page: ${page.title}`)
        } else {
          this.log('info', `[INTERACTIVE] Publishing new page: ${page.title}`)
          this.log('warning', 'LIVE API CALL - This will create a new page in ReadMe!', true)
        }
      } else if (answer === 's') {
        this.log('info', '[INTERACTIVE] SKIP ALL - Exiting interactive mode')
        process.exit(0)
      } else if (answer === 'e') {
        this.log('info', '[INTERACTIVE] Exiting interactive mode')
        process.exit(0)
      } else {
        this.log('info', `[INTERACTIVE] Skipping new page: ${page.title}`)
        return {
          slug: page.slug || page.title,
          title: page.title,
          status: 'skipped',
          action: 'skipped',
          message: 'User chose to skip',
        }
      }
    }

    // Only reach here if not dry-run or if interactive chose to publish
    if (!dryRun && !interactive) {
      this.log('info', `[LIVE PUBLISH] Creating new page: ${page.title}`)
      this.log('warning', 'LIVE API CALL - This will create a new page in ReadMe!', true)
    }

    try {
      const apiResponse = await this.callCreatePageAPI(
        {
          title: page.title,
          slug: page.slug,
          localPath: page.localPath,
          order: page.order,
        },
        parentDoc,
        categoryId,
        dryRun,
      )

      return {
        slug: page.slug ?? page.title,
        title: page.title,
        id: apiResponse.id,
        status: 'success',
        action: 'created',
        message: dryRun ? 'DRY RUN: Simulated create' : undefined,
      }
    } catch (error) {
      this.log('error', `Failed to create page "${page.title}": ${(error as Error).message}`)
      throw error
    }
  }

  private async updateExistingPage(
    pageWithParent: PageWithParent,
    dryRun: boolean,
    interactive: boolean,
  ): Promise<PublishPageResult> {
    const { page, parentDoc, categoryId } = pageWithParent

    if (dryRun && !interactive) {
      this.log('info', `[DRY RUN] Simulating update of existing page: ${page.title}`)
      return {
        slug: page.slug ?? page.title,
        title: page.title,
        id: page.id ?? undefined,
        status: 'success',
        action: 'updated',
        message: 'DRY RUN: Would update existing page',
      }
    }

    if (interactive) {
      let answer = await this.askUser(`📝 UPDATE: ${page.title}`)

      while (answer === 'p') {
        this.showPagePreview(page)
        answer = await this.askUser(`📝 UPDATE: ${page.title}`)
      }

      if (answer === 'y') {
        if (dryRun) {
          this.log(
            'info',
            `[DRY RUN INTERACTIVE] Simulating update of existing page: ${page.title}`,
          )
        } else {
          this.log('info', `[INTERACTIVE] Publishing existing page: ${page.title}`)
        }
      } else if (answer === 's') {
        this.log('info', '[INTERACTIVE] SKIP ALL - Exiting interactive mode')
        process.exit(0)
      } else if (answer === 'e') {
        this.log('info', '[INTERACTIVE] Exiting interactive mode')
        process.exit(0)
      } else {
        this.log('info', `[INTERACTIVE] Skipping existing page: ${page.title}`)
        return {
          slug: page.slug ?? page.title,
          title: page.title,
          id: page.id ?? undefined,
          status: 'skipped',
          action: 'skipped',
          message: 'User chose to skip',
        }
      }
    }

    // Only reach here if not dry-run or if interactive chose to publish
    if (!dryRun && !interactive) {
      this.log('info', `[LIVE PUBLISH] Updating existing page: ${page.title}`)
    }

    try {
      const apiResponse = await this.callUpdatePageAPI(
        {
          title: page.title,
          slug: page.slug,
          id: page.id,
          localPath: page.localPath,
          order: page.order,
        },
        parentDoc,
        categoryId,
        dryRun,
      )

      return {
        slug: page.slug ?? page.title,
        title: page.title,
        id: apiResponse.id,
        status: 'success',
        action: 'updated',
        message: dryRun ? 'DRY RUN: Simulated update' : undefined,
      }
    } catch (error) {
      this.log('error', `Failed to update page "${page.title}": ${(error as Error).message}`)
      throw error
    }
  }

  private async callCreatePageAPI(
    page: { title: string; slug?: string | null; localPath?: string; order?: number | null },
    parentDoc?: string,
    categoryId?: string,
    dryRun: boolean = false,
  ): Promise<{ id: string }> {
    const markdownContent = page.localPath ? this.readMarkdownContent(page.localPath) : ''

    const requestBody = {
      title: page.title,
      type: 'basic', // Most common type as per API docs
      body: markdownContent,
      category: categoryId,
      hidden: false,
      order: page.order || 999, // Use page order, fallback to 999 for auto-ordering
      ...(parentDoc && { parentDoc }), // Only include if there's a parent
    }

    if (dryRun) {
      return { id: `dry-run-mock-id-${Date.now()}` }
    }

    const response = await fetch('https://dash.readme.com/api/v1/docs', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ReadMe API CREATE error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    this.log('success', `Created page "${page.title}" with ID: ${result.id}`)

    // Rate limiting: delay before next API call
    await this.delay(this.API_DELAY_MS)

    return { id: result.id }
  }

  private async callUpdatePageAPI(
    page: {
      title: string
      slug?: string | null
      id?: string | null
      localPath?: string
      order?: number | null
    },
    parentDoc?: string,
    categoryId?: string,
    dryRun: boolean = false,
  ): Promise<{ id: string }> {
    const slug = page.slug || page.title.toLowerCase().replace(/\s+/g, '-')
    const markdownContent = page.localPath ? this.readMarkdownContent(page.localPath) : ''

    const requestBody = {
      title: page.title,
      type: 'basic', // Most common type as per API docs
      body: markdownContent,
      category: categoryId,
      hidden: false,
      order: page.order || 999, // Use page order, fallback to 999 for auto-ordering
      ...(parentDoc && { parentDoc }), // Only include if there's a parent
    }

    if (dryRun) {
      return { id: page.id ?? `dry-run-mock-id-${Date.now()}` }
    }

    const response = await fetch(`https://dash.readme.com/api/v1/docs/${slug}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ReadMe API UPDATE error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    this.log('success', `Updated page "${page.title}" (${slug})`)

    // Rate limiting: delay before next API call
    await this.delay(this.API_DELAY_MS)

    return { id: result.id || page.id || 'unknown' }
  }

  private readMarkdownContent(filePath: string): string {
    try {
      // Handle both absolute and relative paths
      const resolvedPath = filePath.startsWith('/')
        ? filePath
        : `.docs/temp-publish-docs/${this.categorySlug}/${filePath.replace(/^docs\//, '')}`

      const content = readFileSync(resolvedPath, 'utf-8')

      if (!content.trim()) {
        this.log('warning', `File ${filePath} is empty`)
      }

      return content
    } catch (error) {
      const errorMsg = `Failed to read file ${filePath}: ${(error as Error).message}`
      this.log('error', errorMsg)
      throw new Error(errorMsg)
    }
  }

  private printSummary(result: PublishResult, dryRun: boolean, interactive: boolean): void {
    console.log('\n' + '='.repeat(60))
    if (dryRun && interactive) {
      this.log('info', 'DRY RUN INTERACTIVE SUMMARY - NO CHANGES WERE MADE:')
      console.log('   This was an interactive simulation only')
    } else if (dryRun) {
      this.log('info', 'DRY RUN SUMMARY - NO CHANGES WERE MADE:')
      console.log('   This was a simulation only')
    } else if (interactive) {
      this.log('info', 'INTERACTIVE MODE SUMMARY - REVIEW SUMMARY BELOW:')
      console.log('   You reviewed and chose what to publish')
    } else {
      this.log('info', 'LIVE PUBLISH SUMMARY - CHANGES WERE MADE TO README:')
      console.log('   Live changes have been published!')
    }
    console.log('='.repeat(60))

    const prefix = dryRun ? '[DRY RUN] ' : '[LIVE] '
    console.log(`${prefix}New pages: ${result.newPages.length}`)
    console.log(`${prefix}Updated pages: ${result.updatedPages.length}`)
    console.log(`${prefix}Skipped pages: ${result.skippedPages.length}`)
    console.log(`${prefix}Errors: ${result.errors.length}`)
    console.log(`${prefix}Total processed: ${result.totalProcessed}`)
    console.log(`${prefix}Total skipped: ${result.totalSkipped}`)

    if (result.errors.length > 0) {
      this.log('error', 'ERRORS:')
      result.errors.forEach(error => {
        console.log(`  - ${error.title} (${error.action}): ${error.error}`)
      })
    }

    if (dryRun && interactive) {
      this.log('success', 'DRY RUN INTERACTIVE COMPLETE - Ready for live publishing!')
      console.log('   To publish for real, run: npm run docs:publish -- --interactive')
    } else if (dryRun) {
      this.log('success', 'DRY RUN COMPLETE - Ready for live publishing!')
      console.log('   To publish for real, run: npm run docs:publish')
    } else if (interactive) {
      this.log('success', 'INTERACTIVE MODE COMPLETE - Review summary above')
    } else {
      this.log('success', 'LIVE PUBLISH COMPLETE - Changes are now live on ReadMe!')
    }
    console.log('='.repeat(60))
  }

  private async askUser(question: string): Promise<string> {
    if (!this.rl) {
      return 'y' // Default to 'yes' if not interactive
    }

    console.log('\n' + '-'.repeat(60))
    console.log(question)
    console.log('Options:')
    console.log('  y = YES, publish this page')
    console.log('  n = NO, skip this page')
    console.log('  s = SKIP ALL remaining pages')
    console.log('  e = EXIT interactive mode')
    console.log('  p = PREVIEW page content')
    console.log('-'.repeat(60))

    const answer = await new Promise<string>(resolve => {
      this.rl!.question('Your choice [y/n/s/e/p]: ', resolve)
    })

    return answer.toLowerCase().trim()
  }

  private showPagePreview(page: ProcessedPage): void {
    this.log('info', 'PAGE PREVIEW:')
    console.log(`Title: ${page.title}`)
    console.log(`Slug: ${page.slug || 'auto-generated'}`)
    console.log(`Path: ${page.localPath || 'unknown'}`)
    console.log(`Is New: ${page.isNew ? 'YES (CREATE)' : 'NO (UPDATE)'}`)

    if (page.localPath) {
      try {
        const content = this.readMarkdownContent(page.localPath)
        const preview = content.slice(0, 300)
        console.log(
          `Content preview (first 300 chars):\n${preview}${content.length > 300 ? '...' : ''}`,
        )
      } catch (error) {
        console.log(`Content: Unable to read file - ${(error as Error).message}`)
      }
    }
    console.log('')
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    // Get API key from command line argument or environment variable
    const apiKeyArg = process.argv.find(arg => arg.startsWith('--key='))
    const apiKey = apiKeyArg ? apiKeyArg.replace('--key=', '') : process.env.README_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ README_API_KEY not found or empty!')
      console.error('   Pass it via: npm run docs:publish -- --key=your_api_key_here')
      console.error('   Or create a .env file with: README_API_KEY=your_api_key_here')
      process.exit(1)
    }

    const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d')
    const interactive = process.argv.includes('--interactive') || process.argv.includes('-i')

    if (dryRun && interactive) {
      console.log('🔍 Starting DRY RUN INTERACTIVE MODE...')
      console.log('   You will be prompted to review pages safely without making changes')
      console.log('   Options: y=simulate publish, n=skip, s=skip all, e=exit, p=preview')
    } else if (dryRun) {
      console.log('🔍 Starting DRY RUN mode...')
    } else if (interactive) {
      console.log('🔍 Starting INTERACTIVE MODE...')
      console.log('   You will be prompted to review and choose what to publish')
      console.log('   Options: y=publish, n=skip, s=skip all, e=exit, p=preview')
    } else {
      console.log('🔍 Starting LIVE PUBLISH mode...')
      console.log('   This will make REAL changes to ReadMe!')
    }

    const publisher = new ReadmePublisher(apiKey.trim(), interactive)
    const result = await publisher.publishDocs(dryRun, interactive)

    if (result.errors.length > 0) {
      console.error(`\n❌ Publishing completed with ${result.errors.length} error(s)`)
      console.error('   Check the error details above')
      process.exit(1)
    }

    console.log(
      `\n✅ Publishing completed successfully! (${result.totalProcessed} pages processed)`,
    )
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Publishing failed with unexpected error:')
    console.error(`   ${(error as Error).message}`)
    console.error('\n   Please check your configuration and try again')
    process.exit(1)
  }
}

// Run if called directly
if (!process.env.VITEST) {
  void main()
}
