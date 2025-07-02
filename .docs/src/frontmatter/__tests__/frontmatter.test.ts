/**
 * FRONTMATTER SYSTEM TESTS
 *
 * Tests for the complete frontmatter synchronization system that:
 * - Reads and parses docs-lock.yml files (LockFileReader)
 * - Processes individual markdown files for YAML frontmatter (FrontmatterProcessor)
 * - Orchestrates the complete sync workflow (FrontmatterSync)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml'

import { LockFileReader } from '../lockfileReader'
import { FrontmatterProcessor } from '../frontmatterProcessor'
import { FrontmatterSync } from '../frontmatterSync'
import type { LockfileData, ProcessedPage } from '../../shared/types'

// Mock file system operations and process.exit
vi.mock('fs')
vi.mock('js-yaml')

const mockReadFileSync = vi.mocked(readFileSync)
const mockWriteFileSync = vi.mocked(writeFileSync)
const mockYamlLoad = vi.mocked(yaml.load)
const mockYamlDump = vi.mocked(yaml.dump)

// Mock process.exit to prevent it from actually exiting during tests
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called')
})

describe('Frontmatter System', () => {
  /**
   * LockFileReader Tests
   *
   * The LockFileReader is responsible for:
   * - Reading and parsing docs-lock.yml files
   * - Extracting page data from nested structures
   * - Maintaining parent-child relationships between pages
   */
  describe('LockFileReader', () => {
    let lockFileReader: LockFileReader
    let mockLockfileData: LockfileData

    beforeEach(() => {
      vi.clearAllMocks()
      mockProcessExit.mockClear()
      lockFileReader = new LockFileReader()
      mockLockfileData = {
        timestamp: '2024-01-01T00:00:00.000Z',
        targetCategory: 'react-sdk',
        totalCategories: 1,
        totalPages: 3,
        pagesWithChildren: 1,
        categories: [
          {
            id: '123',
            title: 'React SDK',
            slug: 'react-sdk',
            totalPages: 3,
            structure: [
              {
                id: 'page1',
                title: 'Getting Started',
                slug: 'getting-started',
                order: 1,
                hidden: false,
                localPath: 'docs/getting-started.md',
                children: [
                  {
                    id: 'page2',
                    title: 'Authentication',
                    slug: 'authentication',
                    order: 1,
                    hidden: false,
                    localPath: 'docs/authentication.md',
                    children: [],
                  },
                ],
              },
              {
                id: 'page3',
                title: 'Integration Guide',
                slug: 'integration-guide',
                order: 2,
                hidden: false,
                localPath: 'docs/integration-guide.md',
                children: [],
              },
            ],
          },
        ],
        metadata: {
          apiRequestCount: 5,
          discoveredRelationships: 3,
          hierarchicalRelationships: 1,
          executionTimeMs: 1500,
        },
      }
    })

    describe('readLockFile', () => {
      it('should successfully read and parse a valid lock file', () => {
        // Arrange
        const mockFileContent = 'timestamp: 2024-01-01T00:00:00.000Z'
        mockReadFileSync.mockReturnValue(mockFileContent)
        mockYamlLoad.mockReturnValue(mockLockfileData)

        // Act
        const result = lockFileReader.readLockFile('.docs/docs-lock.yml')

        // Assert
        expect(mockReadFileSync).toHaveBeenCalledWith('.docs/docs-lock.yml', 'utf-8')
        expect(mockYamlLoad).toHaveBeenCalledWith(mockFileContent)
        expect(result).toEqual(mockLockfileData)
      })

      it('should throw error when lock file has no categories', () => {
        // Arrange
        const invalidData = { ...mockLockfileData, categories: [] }
        mockReadFileSync.mockReturnValue('categories: []')
        mockYamlLoad.mockReturnValue(invalidData)

        // Act & Assert
        expect(() => lockFileReader.readLockFile('.docs/docs-lock.yml')).toThrow(
          'Invalid lock file format: no categories found',
        )
      })

      it('should throw error when lock file cannot be read', () => {
        // Arrange
        mockReadFileSync.mockImplementation(() => {
          throw new Error('ENOENT: no such file or directory')
        })

        // Act & Assert
        expect(() => lockFileReader.readLockFile('.docs/docs-lock.yml')).toThrow(
          'Failed to read lock file',
        )
      })
    })

    describe('extractAllPages', () => {
      it('should extract all pages from nested structure', () => {
        // Act
        const pages = lockFileReader.extractAllPages(mockLockfileData)

        // Assert
        expect(pages).toHaveLength(3)
        expect(pages.map(p => p.slug)).toEqual([
          'getting-started',
          'authentication',
          'integration-guide',
        ])
        expect(pages.every(p => p.title && p.slug)).toBe(true)
      })

      it('should handle empty categories', () => {
        // Arrange
        const emptyData = {
          ...mockLockfileData,
          categories: [{ ...mockLockfileData.categories[0]!, structure: [] }],
        }

        // Act
        const pages = lockFileReader.extractAllPages(emptyData)

        // Assert
        expect(pages).toHaveLength(0)
        expect(Array.isArray(pages)).toBe(true)
      })
    })

    describe('extractAllPagesWithParents', () => {
      it('should extract pages with correct parent relationships', () => {
        // Act
        const pagesWithParents = lockFileReader.extractAllPagesWithParents(mockLockfileData)

        // Assert
        expect(pagesWithParents).toHaveLength(3)

        const authPage = pagesWithParents.find(p => p.page.slug === 'authentication')
        expect(authPage?.parentId).toBe('page1') // Authentication is child of Getting Started

        const gettingStartedPage = pagesWithParents.find(p => p.page.slug === 'getting-started')
        expect(gettingStartedPage?.parentId).toBeUndefined() // Getting Started is root level
      })
    })
  })

  /**
   * FrontmatterProcessor Tests
   *
   * The FrontmatterProcessor handles:
   * - Reading markdown files and parsing existing YAML frontmatter
   * - Generating correct frontmatter from page data
   * - Writing updated frontmatter back to files
   * - Determining appropriate action (add/update/skip)
   */
  describe('FrontmatterProcessor', () => {
    let processor: FrontmatterProcessor
    let mockPage: ProcessedPage

    beforeEach(() => {
      vi.clearAllMocks()
      mockProcessExit.mockClear()
      processor = new FrontmatterProcessor()
      mockPage = {
        id: 'page1',
        title: 'Getting Started',
        slug: 'getting-started',
        order: 1,
        hidden: false,
        localPath: 'docs/getting-started.md',
        children: [],
      }
    })

    describe('processFile', () => {
      it('should add frontmatter to file without existing frontmatter', () => {
        // Arrange
        const fileContent = '# Getting Started\n\nThis is the content.'
        mockReadFileSync.mockReturnValue(fileContent)
        mockYamlDump.mockReturnValue('title: Getting Started\nslug: getting-started\n')

        // Act
        const action = processor.processFile(mockPage)

        // Assert
        expect(action).toBe('added')
        expect(mockWriteFileSync).toHaveBeenCalled()
        expect(mockYamlDump).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Getting Started',
            slug: 'getting-started',
          }),
          expect.any(Object),
        )
      })

      it('should update frontmatter when it differs from expected', () => {
        // Arrange
        const fileWithFrontmatter = `---
title: Old Title
slug: old-slug
---
# Getting Started

Content here.`
        mockReadFileSync.mockReturnValue(fileWithFrontmatter)
        mockYamlLoad.mockReturnValue({
          title: 'Old Title',
          slug: 'old-slug',
          category: '6849ddd92905ee0053320687',
          excerpt: 'Old excerpt',
          hidden: false,
          order: 1,
        })
        mockYamlDump.mockReturnValue('title: Getting Started\nslug: getting-started\n')

        // Act
        const action = processor.processFile(mockPage)

        // Assert
        expect(action).toBe('updated')
        expect(mockWriteFileSync).toHaveBeenCalled()
      })

      it('should skip file when frontmatter is already correct', () => {
        // Arrange
        const correctFrontmatter = {
          title: 'Getting Started',
          slug: 'getting-started',
          category: '6849ddd92905ee0053320687',
          hidden: false,
          order: 1,
        }
        const fileWithCorrectFrontmatter = `---
title: Getting Started
slug: getting-started
category: 6849ddd92905ee0053320687
hidden: false
order: 1
---
Content`

        mockReadFileSync.mockReturnValue(fileWithCorrectFrontmatter)
        mockYamlLoad.mockReturnValue(correctFrontmatter)

        // Act
        const action = processor.processFile(mockPage)

        // Assert
        expect(action).toBe('skipped')
        expect(mockWriteFileSync).not.toHaveBeenCalled()
      })

      it('should handle parent document relationships', () => {
        // Arrange
        const childPage = { ...mockPage, title: 'Authentication', slug: 'authentication' }
        const parentId = 'parent-page-id'

        mockReadFileSync.mockReturnValue('# Authentication\n\nContent')
        mockYamlDump.mockReturnValue('title: Authentication\nparentDoc: parent-page-id\n')

        // Act
        processor.processFile(childPage, parentId)

        // Assert
        expect(mockYamlDump).toHaveBeenCalledWith(
          expect.objectContaining({
            parentDoc: parentId,
          }),
          expect.any(Object),
        )
      })

      it('should throw error when file has no local path', () => {
        // Arrange
        const pageWithoutPath = { ...mockPage, localPath: undefined }

        // Act & Assert
        expect(() => processor.processFile(pageWithoutPath)).toThrow(
          'No local path for page: Getting Started',
        )
      })

      it('should generate slug from title when slug is missing', () => {
        // Arrange
        const pageWithoutSlug = { ...mockPage, slug: null }
        mockReadFileSync.mockReturnValue('# Content')
        mockYamlDump.mockReturnValue('title: Getting Started\nslug: getting-started\n')

        // Act
        processor.processFile(pageWithoutSlug)

        // Assert
        expect(mockYamlDump).toHaveBeenCalledWith(
          expect.objectContaining({
            slug: 'getting-started',
          }),
          expect.any(Object),
        )
      })

      it('should handle special characters in title when generating slug', () => {
        // Arrange
        const pageWithSpecialChars = {
          ...mockPage,
          title: 'API & SDK Integration (v2.0)',
          slug: null,
        }

        mockReadFileSync.mockReturnValue('# Content')
        mockYamlDump.mockReturnValue('slug: api-sdk-integration-v20\n')

        // Act
        processor.processFile(pageWithSpecialChars)

        // Assert - test that the generated slug is URL-friendly
        const dumpCall = mockYamlDump.mock.calls[0]?.[0] as any
        expect(dumpCall?.slug).toMatch(/^api.*sdk.*integration.*v.*20$/)
        expect(dumpCall?.slug).not.toContain('&')
        expect(dumpCall?.slug).not.toContain('(')
        expect(dumpCall?.slug).not.toContain(')')
      })

      it('should preserve existing excerpts without generating new ones', () => {
        // Arrange
        const existingExcerpt = 'Custom manually written excerpt'
        const fileWithExistingExcerpt = `---
title: Getting Started
slug: getting-started
category: 6849ddd92905ee0053320687
excerpt: ${existingExcerpt}
hidden: false
order: 1
---
Content`

        mockReadFileSync.mockReturnValue(fileWithExistingExcerpt)
        mockYamlLoad.mockReturnValue({
          title: 'Getting Started',
          slug: 'getting-started',
          category: '6849ddd92905ee0053320687',
          excerpt: existingExcerpt,
          hidden: false,
          order: 1,
        })

        // Act
        const action = processor.processFile(mockPage)

        // Assert - should skip because existing excerpt is preserved
        expect(action).toBe('skipped')
        expect(mockWriteFileSync).not.toHaveBeenCalled()
      })

      it('should not add excerpt field when none exists', () => {
        // Arrange
        const fileWithoutExcerpt = '# Getting Started\n\nContent'
        mockReadFileSync.mockReturnValue(fileWithoutExcerpt)
        mockYamlDump.mockReturnValue('title: Getting Started\n')

        // Act
        processor.processFile(mockPage)

        // Assert - should not include excerpt in generated frontmatter
        const dumpCall = mockYamlDump.mock.calls[0]?.[0] as any
        expect(dumpCall?.excerpt).toBeUndefined()
        expect(mockYamlDump).toHaveBeenCalledWith(
          expect.not.objectContaining({
            excerpt: expect.anything(),
          }),
          expect.any(Object),
        )
      })
    })

    describe('frontmatter parsing', () => {
      it('should correctly parse valid YAML frontmatter', () => {
        // Arrange
        const validFrontmatter = `---
title: Test Page
slug: test-page
hidden: false
order: 5
---
Content here`

        mockReadFileSync.mockReturnValue(validFrontmatter)
        mockYamlLoad.mockReturnValue({
          title: 'Test Page',
          slug: 'test-page',
          hidden: false,
          order: 5,
        })

        // Act
        processor.processFile(mockPage)

        // Assert
        expect(mockYamlLoad).toHaveBeenCalled()
        const yamlContent = mockYamlLoad.mock.calls[0]?.[0]
        expect(yamlContent).toContain('title: Test Page')
        expect(yamlContent).toContain('slug: test-page')
      })

      it('should handle malformed YAML frontmatter', () => {
        // Arrange
        const malformedFrontmatter = `---
title: Test Page
invalid: yaml: structure:
---
Content`

        mockReadFileSync.mockReturnValue(malformedFrontmatter)
        mockYamlLoad.mockImplementation(() => {
          throw new Error('Invalid YAML')
        })

        // Act & Assert
        expect(() => processor.processFile(mockPage)).toThrow('Invalid YAML frontmatter')
      })

      it('should handle missing frontmatter delimiters', () => {
        // Arrange
        const noFrontmatter = 'Just regular markdown content'
        mockReadFileSync.mockReturnValue(noFrontmatter)
        mockYamlDump.mockReturnValue('title: Getting Started\n')

        // Act
        const action = processor.processFile(mockPage)

        // Assert
        expect(action).toBe('added')
        expect(mockYamlLoad).not.toHaveBeenCalled() // No YAML to parse
      })
    })
  })

  /**
   * FrontmatterSync Tests
   *
   * The FrontmatterSync orchestrates the complete workflow:
   * - Reading the docs-lock.yml file
   * - Processing all markdown files for frontmatter updates
   * - Providing summary statistics and error reporting
   * - Coordinating between LockFileReader and FrontmatterProcessor
   */
  describe('FrontmatterSync', () => {
    let sync: FrontmatterSync

    beforeEach(() => {
      vi.clearAllMocks()
      mockProcessExit.mockClear()
      sync = new FrontmatterSync()
    })

    describe('printSummary', () => {
      it('should display correct summary information', () => {
        // Arrange
        const mockResult = {
          totalFiles: 10,
          filesAdded: 3,
          filesUpdated: 4,
          filesSkipped: 2,
          errors: 1,
        }
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        // Act
        sync.printSummary(mockResult)

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith('✓ Processed 10 files')
        expect(consoleSpy).toHaveBeenCalledWith('  Added frontmatter: 3')
        expect(consoleSpy).toHaveBeenCalledWith('  Updated frontmatter: 4')
        expect(consoleSpy).toHaveBeenCalledWith('  Skipped (no changes): 2')
        expect(consoleSpy).toHaveBeenCalledWith('  Errors: 1')

        consoleSpy.mockRestore()
      })

      it('should not show errors when there are none', () => {
        // Arrange
        const perfectResult = {
          totalFiles: 5,
          filesAdded: 2,
          filesUpdated: 2,
          filesSkipped: 1,
          errors: 0,
        }
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        // Act
        sync.printSummary(perfectResult)

        // Assert
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Errors:'))

        consoleSpy.mockRestore()
      })
    })
  })
})
