import { readFileSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml'
import type { ProcessedPage } from '../../shared/types'

// Magic number for unordered pages (ReadMe default)
const UNORDERED_PAGE_ORDER = 999

interface FrontMatter {
  title: string
  excerpt?: string
  hidden?: boolean
  order?: number
}

interface ParsedFile {
  frontmatter: FrontMatter | null
  content: string
  hasFrontmatter: boolean
}

export type ProcessAction = 'added' | 'updated' | 'skipped'

export class FrontmatterProcessor {
  processFile(page: ProcessedPage, parentId?: string): ProcessAction {
    if (!page.localPath) {
      throw new Error(`No local path for page: ${page.title}`)
    }

    try {
      const parsed = this.parseMarkdownFile(page.localPath)
      const expectedFrontmatter = this.createExpectedFrontmatter(
        page,
        parentId,
        parsed.frontmatter || undefined,
      )

      if (!parsed.hasFrontmatter) {
        this.addFrontmatter(page.localPath, expectedFrontmatter, parsed.content)
        return 'added'
      }

      if (this.needsUpdate(parsed.frontmatter!, expectedFrontmatter)) {
        this.updateFrontmatter(page.localPath, expectedFrontmatter, parsed.content)
        return 'updated'
      }

      return 'skipped'
    } catch (error) {
      throw new Error(`Failed to process ${page.localPath}: ${(error as Error).message}`)
    }
  }

  private parseMarkdownFile(filePath: string): ParsedFile {
    const content = readFileSync(filePath, 'utf-8')

    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)

    if (!frontmatterMatch || !frontmatterMatch[1] || !frontmatterMatch[2]) {
      return {
        frontmatter: null,
        content: content,
        hasFrontmatter: false,
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawFrontmatter = yaml.load(frontmatterMatch[1]) as Record<string, any>
      const frontmatter: FrontMatter = {
        title: typeof rawFrontmatter.title === 'string' ? rawFrontmatter.title : '',
      }

      // Only include hidden if it's actually true
      if (typeof rawFrontmatter.hidden === 'boolean' && rawFrontmatter.hidden) {
        frontmatter.hidden = rawFrontmatter.hidden
      }

      // Only include excerpt if it's present and a string
      if (typeof rawFrontmatter.excerpt === 'string') {
        frontmatter.excerpt = rawFrontmatter.excerpt
      }

      // Only include order if it's present and a number
      if (typeof rawFrontmatter.order === 'number') {
        frontmatter.order = rawFrontmatter.order
      }
      return {
        frontmatter,
        content: frontmatterMatch[2],
        hasFrontmatter: true,
      }
    } catch (error) {
      throw new Error(`Invalid YAML frontmatter: ${(error as Error).message}`)
    }
  }

  private createExpectedFrontmatter(
    page: ProcessedPage,
    parentId?: string,
    existingFrontmatter?: FrontMatter,
  ): FrontMatter {
    const frontmatter: FrontMatter = {
      title: page.title,
    }

    // Only include hidden if it's actually true
    if (page.hidden) {
      frontmatter.hidden = page.hidden
    }

    // Preserve existing excerpt if it exists, don't generate new ones
    if (existingFrontmatter?.excerpt) {
      frontmatter.excerpt = existingFrontmatter.excerpt
    }

    // Only include order if it's a valid number and not the default value (UNORDERED_PAGE_ORDER = unordered)
    if (typeof page.order === 'number' && page.order !== UNORDERED_PAGE_ORDER) {
      frontmatter.order = page.order
    }

    return frontmatter
  }

  private needsUpdate(current: FrontMatter, expected: FrontMatter): boolean {
    return (
      current.title !== expected.title ||
      current.excerpt !== expected.excerpt ||
      current.hidden !== expected.hidden ||
      current.order !== expected.order
    )
  }

  private addFrontmatter(filePath: string, frontmatter: FrontMatter, content: string): void {
    const yamlFrontmatter = yaml.dump(frontmatter, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    })

    const newContent = `---\n${yamlFrontmatter}---\n${content}`
    writeFileSync(filePath, newContent, 'utf-8')
  }

  private updateFrontmatter(filePath: string, frontmatter: FrontMatter, content: string): void {
    this.addFrontmatter(filePath, frontmatter, content)
  }
}
