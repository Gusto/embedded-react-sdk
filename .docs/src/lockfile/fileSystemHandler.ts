import { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync } from 'fs'
import { join, basename } from 'path'

export interface LocalFileInfo {
  localPath: string
  title: string
  modifiedAt: Date
  parentPath?: string
}

export class FileSystemHandler {
  private readonly docsDirectory = 'docs'

  // Public interface (what users need)
  scanLocalFiles(): Map<string, LocalFileInfo> {
    const localFiles = new Map<string, LocalFileInfo>()
    this.scanDirectoryRecursiveSync(this.docsDirectory, localFiles)
    return localFiles
  }

  generateLocalPath(
    slug: string,
    parentSlug?: string,
    grandparentSlug?: string,
    localFiles?: Map<string, LocalFileInfo>,
  ): string | undefined {
    if (localFiles?.has(slug)) {
      return localFiles.get(slug)?.localPath
    }

    const potentialPaths = this.buildPotentialPaths(slug, parentSlug, grandparentSlug)
    return this.findFirstExistingPath(potentialPaths)
  }

  getFileModificationTime(filePath: string): Date | null {
    try {
      const stats = statSync(filePath)
      return stats.mtime
    } catch {
      return null
    }
  }

  // I/O operations
  ensureDirectory(dirPath: string): void {
    try {
      mkdirSync(dirPath, { recursive: true })
    } catch {
      // Directory may already exist, continue silently
    }
  }

  writeYamlFile(filePath: string, content: string): void {
    try {
      writeFileSync(filePath, content, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`)
    }
  }

  private scanDirectoryRecursiveSync(
    dirPath: string,
    localFiles: Map<string, LocalFileInfo>,
    parentPath?: string,
  ): void {
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)

        if (entry.isDirectory() && this.shouldScanDirectory(entry.name)) {
          const currentDirSlug = entry.name
          this.scanDirectoryRecursiveSync(fullPath, localFiles, currentDirSlug)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          this.processMarkdownFile(fullPath, localFiles, parentPath)
        }
      }
    } catch {
      // Directory may not exist or be inaccessible, continue silently
    }
  }

  // Private implementation (in logical order)
  private shouldScanDirectory(dirName: string): boolean {
    const excludedDirs = ['node_modules', '.git', '.docs', 'dist', 'build']
    return !excludedDirs.includes(dirName) && !dirName.startsWith('.')
  }

  private processMarkdownFile(
    filePath: string,
    localFiles: Map<string, LocalFileInfo>,
    parentPath?: string,
  ): void {
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      const title = this.extractFileTitle(fileContent)
      const stats = statSync(filePath)

      const slug = basename(filePath, '.md')

      localFiles.set(slug, {
        localPath: filePath,
        title,
        modifiedAt: new Date(stats.mtime),
        parentPath,
      })
    } catch {
      // File may be unreadable or have access issues, skip it
    }
  }

  private extractFileTitle(content: string): string {
    // Try to find markdown heading first
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch?.[1]) return titleMatch[1]

    // Fallback: try to extract from first meaningful non-comment line
    const lines = content.split('\n')
    for (const line of lines) {
      const cleanLine = line.trim()
      // Skip empty lines, HTML comments, and table separator lines
      if (
        cleanLine &&
        !cleanLine.startsWith('<!--') &&
        !cleanLine.startsWith('|') &&
        !cleanLine.match(/^[-\s|:]+$/)
      ) {
        // Extract meaningful text, remove markdown formatting
        const cleanTitle = cleanLine
          .replace(/^[#*\->\s]+/, '') // Remove markdown prefixes
          .replace(/[*_`]/g, '') // Remove markdown formatting
          .trim()

        if (cleanTitle) {
          // Smart title shortening for better readability
          return this.smartTitleShorten(cleanTitle)
        }
      }
    }

    return 'Untitled'
  }

  private smartTitleShorten(title: string): string {
    // Handle common patterns to make titles more concise
    if (title.toLowerCase().includes('events') && title.toLowerCase().includes('components')) {
      return 'Event Types'
    }

    // If title is too long, truncate intelligently
    if (title.length > 60) {
      // Try to find a natural break point
      const sentences = title.split(/[.!?]/)
      if (sentences[0] && sentences[0].length <= 60) {
        return sentences[0].trim()
      }

      // Otherwise truncate at word boundary
      const words = title.split(' ')
      let truncated = ''
      for (const word of words) {
        if ((truncated + ' ' + word).trim().length > 50) break
        truncated += (truncated ? ' ' : '') + word
      }
      return truncated.trim() || title.substring(0, 50).trim()
    }

    return title
  }

  private buildPotentialPaths(
    slug: string,
    parentSlug?: string,
    grandparentSlug?: string,
  ): string[] {
    const paths = [`${this.docsDirectory}/${slug}.md`, `${this.docsDirectory}/${slug}/${slug}.md`]

    if (parentSlug) {
      paths.unshift(
        `${this.docsDirectory}/${parentSlug}/${slug}.md`,
        `${this.docsDirectory}/${parentSlug}/${slug}/${slug}.md`,
      )
    }

    if (grandparentSlug && parentSlug) {
      paths.unshift(
        `${this.docsDirectory}/${grandparentSlug}/${parentSlug}/${slug}.md`,
        `${this.docsDirectory}/${grandparentSlug}/${parentSlug}/${slug}/${slug}.md`,
      )
    }

    return paths
  }

  private findFirstExistingPath(paths: string[]): string | undefined {
    for (const path of paths) {
      try {
        statSync(path)
        return path
      } catch {
        continue
      }
    }
    return undefined
  }
}
