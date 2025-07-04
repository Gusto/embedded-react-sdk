import { readFileSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml'
import type { ProcessedPage } from '../shared/types'

interface FrontMatter {
  title: string
  excerpt?: string
  category: string
  slug: string
  hidden: boolean
  order?: number
  parentDoc?: string
}

interface ParsedFile {
  frontmatter: FrontMatter | null
  content: string
  hasFrontmatter: boolean
}

export type ProcessAction = 'added' | 'updated' | 'skipped'

export class FrontmatterProcessor {
  private readonly categoryId = '6849ddd92905ee0053320687' // react-sdk category ID from lock file

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
        category: typeof rawFrontmatter.category === 'string' ? rawFrontmatter.category : '',
        slug: typeof rawFrontmatter.slug === 'string' ? rawFrontmatter.slug : '',
        hidden: typeof rawFrontmatter.hidden === 'boolean' ? rawFrontmatter.hidden : false,
        parentDoc:
          typeof rawFrontmatter.parentDoc === 'string' ? rawFrontmatter.parentDoc : undefined,
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
    const slug = page.slug || this.generateSlugFromTitle(page.title)

    const frontmatter: FrontMatter = {
      title: page.title,
      category: this.categoryId,
      slug,
      hidden: page.hidden || false,
      parentDoc: parentId,
    }

    // Preserve existing excerpt if it exists, don't generate new ones
    if (existingFrontmatter?.excerpt) {
      frontmatter.excerpt = existingFrontmatter.excerpt
    }

    // Only include order if it's a valid number
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

  private needsUpdate(current: FrontMatter, expected: FrontMatter): boolean {
    return (
      current.title !== expected.title ||
      current.category !== expected.category ||
      current.slug !== expected.slug ||
      current.excerpt !== expected.excerpt ||
      current.hidden !== expected.hidden ||
      current.order !== expected.order ||
      current.parentDoc !== expected.parentDoc
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
