/**
 * LOCKFILE SYSTEM TESTS
 *
 * Tests for the complete lockfile generation system that:
 * - Fetches documentation structure from ReadMe API (ReadMeApiClient)
 * - Scans local file system for markdown files (FileSystemHandler)
 * - Builds document trees integrating ReadMe and local data (DocumentTreeBuilder)
 * - Orchestrates the complete workflow and saves results (LockfileGenerator)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync, statSync, readdirSync } from 'fs'
import { readdir } from 'fs/promises'
import * as yaml from 'js-yaml'

import { LockfileGenerator } from '../lockfileGenerator'
import { DocumentTreeBuilder } from '../documentTreeBuilder'
import { ReadMeApiClient } from '../readmeApiClient'
import { FileSystemHandler } from '../fileSystemHandler'
import type { LockfileData, ReadMeCategory, ReadMePage, ProcessedPage } from '../../shared/types'
import type { LocalFileInfo } from '../fileSystemHandler'

// Mock all external dependencies
vi.mock('fs')
vi.mock('fs/promises')
vi.mock('js-yaml')
vi.mock('dotenv', () => ({ config: vi.fn() }))

const mockReadFileSync = vi.mocked(readFileSync)
const mockStatSync = vi.mocked(statSync)
const mockReaddir = vi.mocked(readdir)
const mockReaddirSync = vi.mocked(readdirSync)
const mockYamlDump = vi.mocked(yaml.dump)

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Disable MSW for these tests
vi.mock('msw/node', () => ({}))
vi.mock('msw', () => ({}))

// Mock process.exit and console methods
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called')
})
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Lockfile System', () => {
  /**
   * ReadMeApiClient Tests
   *
   * The ReadMeApiClient handles:
   * - Authentication with ReadMe API using API keys
   * - Fetching categories and pages from ReadMe
   * - Making authenticated HTTP requests with proper error handling
   * - Tracking request counts and providing progress feedback
   */
  describe('ReadMeApiClient', () => {
    let apiClient: ReadMeApiClient
    const mockApiKey = 'test-api-key-123'

    beforeEach(() => {
      vi.clearAllMocks()
      mockFetch.mockClear()
      apiClient = new ReadMeApiClient(mockApiKey)
    })

    describe('constructor', () => {
      it('should create client with valid API key', () => {
        expect(() => new ReadMeApiClient(mockApiKey)).not.toThrow()
        expect(apiClient.getRequestCount()).toBe(0)
      })

      it('should throw error with empty API key', () => {
        expect(() => new ReadMeApiClient('')).toThrow('Invalid or missing ReadMe API key')
      })

      it('should throw error with undefined API key', () => {
        expect(() => new ReadMeApiClient(undefined as any)).toThrow(
          'Invalid or missing ReadMe API key',
        )
      })
    })

    describe('getCategories', () => {
      it('should fetch categories successfully', async () => {
        // Arrange
        const mockCategories: ReadMeCategory[] = [
          { id: '1', title: 'Getting Started', slug: 'getting-started', order: 1 },
          { id: '2', title: 'React SDK', slug: 'react-sdk', order: 2 },
        ]

        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockCategories),
          text: () => Promise.resolve(JSON.stringify(mockCategories)),
          clone: () => ({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockCategories),
            text: () => Promise.resolve(JSON.stringify(mockCategories)),
          }),
        } as any)

        // Act
        const result = await apiClient.getCategories()

        // Assert
        expect(result).toEqual(mockCategories)
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://dash.readme.com/api/v1/categories?page=1&perPage=100',
          }),
        )
        expect(apiClient.getRequestCount()).toBe(1)
      })

      it('should handle API errors properly', async () => {
        // Arrange
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: () => Promise.resolve('Unauthorized'),
          json: () => Promise.reject(new Error('Invalid JSON')),
          clone: () => ({
            ok: false,
            status: 401,
            text: () => Promise.resolve('Unauthorized'),
            json: () => Promise.reject(new Error('Invalid JSON')),
          }),
        } as any)

        // Act & Assert
        await expect(apiClient.getCategories()).rejects.toThrow(
          'ReadMe API Error (401): Unauthorized',
        )
        expect(apiClient.getRequestCount()).toBe(1)
      })

      it('should handle network errors', async () => {
        // Arrange
        mockFetch.mockRejectedValue(new Error('Network error'))

        // Act & Assert
        await expect(apiClient.getCategories()).rejects.toThrow(
          'Failed to fetch /categories?page=1&perPage=100: Network error',
        )
      })
    })

    describe('getCategoryPages', () => {
      it('should fetch category pages with correct URL structure', async () => {
        // Arrange
        const mockPages: ReadMePage[] = [
          {
            id: 'page1',
            title: 'Getting Started',
            slug: 'getting-started',
            order: 1,
            hidden: false,
            children: [],
          },
        ]

        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockPages),
          text: () => Promise.resolve(JSON.stringify(mockPages)),
          clone: () => ({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockPages),
            text: () => Promise.resolve(JSON.stringify(mockPages)),
          }),
        } as any)

        // Act
        const result = await apiClient.getCategoryPages('react-sdk')

        // Assert
        expect(result).toEqual(mockPages)
        expect(mockFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://dash.readme.com/api/v1/categories/react-sdk/docs?perPage=100',
          }),
        )
      })
    })

    describe('fetchAllPageDetails', () => {
      it('should fetch details for all pages with progress tracking', async () => {
        // Arrange
        const mockPages = new Map([
          ['page1', { id: 'page1', slug: 'page1' } as ReadMePage],
          ['page2', { id: 'page2', slug: 'page2' } as ReadMePage],
        ])

        const mockProgressCallback = vi.fn()

        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00.000Z' }),
          text: () => Promise.resolve(JSON.stringify({ updatedAt: '2024-01-01T00:00:00.000Z' })),
          clone: () => ({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00.000Z' }),
            text: () => Promise.resolve(JSON.stringify({ updatedAt: '2024-01-01T00:00:00.000Z' })),
          }),
        } as any)

        // Act
        const result = await apiClient.fetchAllPageDetails(mockPages, mockProgressCallback)

        // Assert
        expect(result.errors).toBe(0)
        expect(mockProgressCallback).toHaveBeenCalledTimes(2)
        expect(mockProgressCallback).toHaveBeenCalledWith(1, 2, 0)
        expect(mockProgressCallback).toHaveBeenCalledWith(2, 2, 0)
        expect(apiClient.getRequestCount()).toBe(2)
      })

      it('should handle individual page fetch errors gracefully', async () => {
        // Arrange
        const mockPages = new Map([
          ['good-page', { id: '1', slug: 'good-page' } as ReadMePage],
          ['bad-page', { id: '2', slug: 'bad-page' } as ReadMePage],
        ])

        const mockProgressCallback = vi.fn()

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00.000Z' }),
            text: () => Promise.resolve(JSON.stringify({ updatedAt: '2024-01-01T00:00:00.000Z' })),
            clone: () => ({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ updatedAt: '2024-01-01T00:00:00.000Z' }),
              text: () =>
                Promise.resolve(JSON.stringify({ updatedAt: '2024-01-01T00:00:00.000Z' })),
            }),
          } as any)
          .mockResolvedValueOnce({
            ok: false,
            status: 404,
            text: () => Promise.resolve('Not found'),
            json: () => Promise.reject(new Error('Invalid JSON')),
            clone: () => ({
              ok: false,
              status: 404,
              text: () => Promise.resolve('Not found'),
              json: () => Promise.reject(new Error('Invalid JSON')),
            }),
          } as any)

        // Act
        const result = await apiClient.fetchAllPageDetails(mockPages, mockProgressCallback)

        // Assert
        expect(result.errors).toBe(1)
        expect(mockProgressCallback).toHaveBeenLastCalledWith(2, 2, 1)
      })
    })

    describe('extractAllPages', () => {
      it('should extract all pages from nested structure', () => {
        // Arrange
        const hierarchicalPages: ReadMePage[] = [
          {
            id: 'parent',
            title: 'Parent Page',
            slug: 'parent',
            order: 1,
            hidden: false,
            children: [
              {
                id: 'child1',
                title: 'Child 1',
                slug: 'child1',
                order: 1,
                hidden: false,
                children: [],
              },
              {
                id: 'child2',
                title: 'Child 2',
                slug: 'child2',
                order: 2,
                hidden: false,
                children: [],
              },
            ],
          },
        ]

        // Act
        const result = ReadMeApiClient.extractAllPages(hierarchicalPages)

        // Assert
        expect(result.size).toBe(3)
        expect(result.has('parent')).toBe(true)
        expect(result.has('child1')).toBe(true)
        expect(result.has('child2')).toBe(true)
      })

      it('should handle empty page arrays', () => {
        // Act
        const result = ReadMeApiClient.extractAllPages([])

        // Assert
        expect(result.size).toBe(0)
        expect(result instanceof Map).toBe(true)
      })
    })
  })

  /**
   * FileSystemHandler Tests
   *
   * The FileSystemHandler manages:
   * - Scanning local directories for markdown files
   * - Extracting file metadata (title, modification time, parent paths)
   * - Building potential file paths for ReadMe pages
   * - Handling file system operations safely with error handling
   */
  describe('FileSystemHandler', () => {
    let fileSystemHandler: FileSystemHandler

    beforeEach(() => {
      vi.clearAllMocks()
      fileSystemHandler = new FileSystemHandler()
    })

    describe('scanLocalFiles', () => {
      it('should scan directory and extract file information', async () => {
        // Arrange
        const mockDirEntries = [
          { name: 'getting-started.md', isFile: () => true, isDirectory: () => false },
        ]

        const mockFileContent = `# Getting Started Guide

This is the content of the getting started guide.`

        const mockStats = {
          mtime: new Date('2024-01-01T10:00:00.000Z'),
        }

        mockReaddirSync.mockReturnValue(mockDirEntries as any)
        mockReadFileSync.mockReturnValue(mockFileContent)
        mockStatSync.mockReturnValue(mockStats as any)

        // Act
        const result = fileSystemHandler.scanLocalFiles()

        // Assert
        expect(result.size).toBe(1)
        const fileInfo = result.get('getting-started')
        expect(fileInfo).toEqual({
          localPath: 'docs/getting-started.md',
          title: 'Getting Started Guide',
          modifiedAt: new Date('2024-01-01T10:00:00.000Z'),
          parentPath: undefined,
        })
      })

      it('should handle nested directory structures', async () => {
        // Arrange - Mock nested directory scanning
        mockReaddirSync
          .mockReturnValueOnce([
            { name: 'workflows-overview', isFile: () => false, isDirectory: () => true },
          ] as any)
          .mockReturnValueOnce([
            { name: 'workflows.md', isFile: () => true, isDirectory: () => false },
          ] as any)

        const mockFileContent = '# Workflow Overview'
        const mockStats = { mtime: new Date('2024-01-01T10:00:00.000Z') }

        mockReadFileSync.mockReturnValue(mockFileContent)
        mockStatSync.mockReturnValue(mockStats as any)

        // Act
        const result = fileSystemHandler.scanLocalFiles()

        // Assert
        expect(result.size).toBe(1)
        const fileInfo = result.get('workflows')
        expect(fileInfo?.parentPath).toBe('workflows-overview')
      })

      it('should skip excluded directories', async () => {
        // Arrange
        const mockDirEntries = [
          { name: 'node_modules', isFile: () => false, isDirectory: () => true },
          { name: '.git', isFile: () => false, isDirectory: () => true },
          { name: '.docs', isFile: () => false, isDirectory: () => true },
          { name: 'valid-folder', isFile: () => false, isDirectory: () => true },
        ]

        mockReaddirSync
          .mockReturnValueOnce(mockDirEntries as any)
          .mockReturnValueOnce([
            { name: 'test.md', isFile: () => true, isDirectory: () => false },
          ] as any)

        mockReadFileSync.mockReturnValue('# Test')
        mockStatSync.mockReturnValue({ mtime: new Date() } as any)

        // Act
        fileSystemHandler.scanLocalFiles()

        // Assert - Should only scan 'valid-folder', not excluded directories
        expect(mockReaddirSync).toHaveBeenCalledTimes(2) // Initial + valid-folder only
      })

      it('should handle file system errors gracefully', () => {
        // Arrange
        mockReaddirSync.mockImplementation(() => {
          throw new Error('Permission denied')
        })

        // Act & Assert - Should not throw, just continue silently
        expect(() => fileSystemHandler.scanLocalFiles()).not.toThrow()
      })
    })

    describe('generateLocalPath', () => {
      it('should return existing local path when available', () => {
        // Arrange
        const mockLocalFiles = new Map([
          ['test-slug', { localPath: 'docs/test-slug.md' } as LocalFileInfo],
        ])

        // Act
        const result = fileSystemHandler.generateLocalPath(
          'test-slug',
          undefined,
          undefined,
          mockLocalFiles,
        )

        // Assert
        expect(result).toBe('docs/test-slug.md')
      })

      it('should find existing file from potential paths', () => {
        // Arrange
        mockStatSync
          .mockImplementationOnce(() => {
            throw new Error('File not found')
          }) // First path fails
          .mockImplementationOnce(() => ({ mtime: new Date() }) as any) // Second path succeeds

        // Act
        const result = fileSystemHandler.generateLocalPath('test-slug')

        // Assert
        expect(result).toBe('docs/test-slug/test-slug.md')
      })

      it('should try parent-based paths first', () => {
        // Arrange
        mockStatSync.mockImplementation(() => ({ mtime: new Date() }) as any)

        // Act
        const result = fileSystemHandler.generateLocalPath('child', 'parent')

        // Assert
        expect(result).toBe('docs/parent/child.md')
        expect(mockStatSync).toHaveBeenCalledWith('docs/parent/child.md')
      })

      it('should return undefined when no paths exist', () => {
        // Arrange
        mockStatSync.mockImplementation(() => {
          throw new Error('File not found')
        })

        // Act
        const result = fileSystemHandler.generateLocalPath('nonexistent')

        // Assert
        expect(result).toBeUndefined()
      })
    })

    describe('getFileModificationTime', () => {
      it('should return modification time for existing file', () => {
        // Arrange
        const mockDate = new Date('2024-01-01T10:00:00.000Z')
        mockStatSync.mockReturnValue({ mtime: mockDate } as any)

        // Act
        const result = fileSystemHandler.getFileModificationTime('test.md')

        // Assert
        expect(result).toEqual(mockDate)
      })

      it('should return null for non-existent file', () => {
        // Arrange
        mockStatSync.mockImplementation(() => {
          throw new Error('File not found')
        })

        // Act
        const result = fileSystemHandler.getFileModificationTime('nonexistent.md')

        // Assert
        expect(result).toBeNull()
      })
    })
  })

  /**
   * DocumentTreeBuilder Tests
   *
   * The DocumentTreeBuilder handles:
   * - Building document trees from ReadMe hierarchical data
   * - Integrating unmapped local files into existing structures
   * - Finding parent-child relationships between documents
   * - Creating final processing results with proper metadata
   */
  describe('DocumentTreeBuilder', () => {
    let treeBuilder: DocumentTreeBuilder
    let mockLocalFiles: Map<string, LocalFileInfo>
    let mockFileSystemHandler: FileSystemHandler

    beforeEach(() => {
      vi.clearAllMocks()
      treeBuilder = new DocumentTreeBuilder()
      mockLocalFiles = new Map()
      mockFileSystemHandler = new FileSystemHandler()
    })

    describe('buildDocumentTree', () => {
      it('should convert ReadMe pages to processed pages', () => {
        // Arrange
        const mockReadMePages: ReadMePage[] = [
          {
            id: 'page1',
            title: 'Getting Started',
            slug: 'getting-started',
            order: 1,
            hidden: false,
            children: [],
          },
          {
            id: 'page2',
            title: 'Integration Guide',
            slug: 'integration-guide',
            order: 2,
            hidden: false,
            children: [],
          },
        ]

        mockLocalFiles.set('getting-started', {
          localPath: 'docs/getting-started.md',
          title: 'Getting Started',
          modifiedAt: new Date(),
        })

        // Act
        const result = treeBuilder.buildDocumentTree(
          mockReadMePages,
          mockLocalFiles,
          mockFileSystemHandler,
        )

        // Assert
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual(
          expect.objectContaining({
            id: 'page1',
            title: 'Getting Started',
            slug: 'getting-started',
            order: 1,
            hidden: false,
            localPath: 'docs/getting-started.md',
            children: [],
          }),
        )
      })

      it('should preserve hierarchical structure from ReadMe', () => {
        // Arrange
        const mockHierarchicalPages: ReadMePage[] = [
          {
            id: 'parent',
            title: 'Parent Page',
            slug: 'parent',
            order: 1,
            hidden: false,
            children: [
              {
                id: 'child',
                title: 'Child Page',
                slug: 'child',
                order: 1,
                hidden: false,
                children: [],
              },
            ],
          },
        ]

        // Act
        const result = treeBuilder.buildDocumentTree(
          mockHierarchicalPages,
          mockLocalFiles,
          mockFileSystemHandler,
        )

        // Assert
        expect(result).toHaveLength(1)
        expect(result[0]?.children).toHaveLength(1)
        expect(result[0]?.children[0]).toEqual(
          expect.objectContaining({
            id: 'child',
            title: 'Child Page',
            slug: 'child',
          }),
        )
      })

      it('should sort pages by order', () => {
        // Arrange
        const unorderedPages: ReadMePage[] = [
          {
            id: 'page3',
            title: 'Third Page',
            slug: 'third',
            order: 3,
            hidden: false,
            children: [],
          },
          {
            id: 'page1',
            title: 'First Page',
            slug: 'first',
            order: 1,
            hidden: false,
            children: [],
          },
          {
            id: 'page2',
            title: 'Second Page',
            slug: 'second',
            order: 2,
            hidden: false,
            children: [],
          },
        ]

        // Act
        const result = treeBuilder.buildDocumentTree(
          unorderedPages,
          mockLocalFiles,
          mockFileSystemHandler,
        )

        // Assert
        expect(result.map(p => p.order)).toEqual([1, 2, 3])
        expect(result.map(p => p.title)).toEqual(['First Page', 'Second Page', 'Third Page'])
      })
    })

    describe('findUnmappedFiles', () => {
      it('should identify files not in ReadMe', () => {
        // Arrange
        const readmePageSlugs = new Set(['existing-page'])
        const localFiles = new Map([
          ['existing-page', { localPath: 'docs/existing.md' } as LocalFileInfo],
          ['new-page', { localPath: 'docs/new.md' } as LocalFileInfo],
          ['another-new-page', { localPath: 'docs/another.md' } as LocalFileInfo],
        ])

        // Act
        const result = treeBuilder.findUnmappedFiles(readmePageSlugs, localFiles)

        // Assert
        expect(result.size).toBe(2)
        expect(result.has('new-page')).toBe(true)
        expect(result.has('another-new-page')).toBe(true)
        expect(result.has('existing-page')).toBe(false)
      })

      it('should return empty map when all files are mapped', () => {
        // Arrange
        const readmePageSlugs = new Set(['page1', 'page2'])
        const localFiles = new Map([
          ['page1', { localPath: 'docs/page1.md' } as LocalFileInfo],
          ['page2', { localPath: 'docs/page2.md' } as LocalFileInfo],
        ])

        // Act
        const result = treeBuilder.findUnmappedFiles(readmePageSlugs, localFiles)

        // Assert
        expect(result.size).toBe(0)
      })
    })

    describe('integrateUnmappedFiles', () => {
      it('should add unmapped files to existing structure', () => {
        // Arrange
        const existingStructure: ProcessedPage[] = [
          {
            id: 'existing',
            title: 'Existing Page',
            slug: 'existing',
            order: 1,
            hidden: false,
            localPath: 'docs/existing.md',
            children: [],
          },
        ]

        const unmappedFiles = new Map([
          [
            'new-page',
            {
              localPath: 'docs/new-page.md',
              title: 'New Page',
              modifiedAt: new Date(),
            } as LocalFileInfo,
          ],
        ])

        // Act
        const result = treeBuilder.integrateUnmappedFiles(existingStructure, unmappedFiles)

        // Assert
        expect(result).toHaveLength(2)
        const newPage = result.find(p => p.title === 'New Page')
        expect(newPage).toEqual(
          expect.objectContaining({
            id: null,
            title: 'New Page',
            slug: null,
            isNew: true,
            localPath: 'docs/new-page.md',
          }),
        )
      })

      it('should handle parent-child relationships for new files', () => {
        // Arrange
        const existingStructure: ProcessedPage[] = [
          {
            id: 'parent',
            title: 'Parent Page',
            slug: 'parent',
            order: 1,
            hidden: false,
            localPath: 'docs/parent.md',
            children: [],
          },
        ]

        const unmappedFiles = new Map([
          [
            'child-page',
            {
              localPath: 'docs/parent/child-page.md',
              title: 'Child Page',
              modifiedAt: new Date(),
              parentPath: 'parent',
            } as LocalFileInfo,
          ],
        ])

        // Act
        const result = treeBuilder.integrateUnmappedFiles(existingStructure, unmappedFiles)

        // Assert
        expect(result).toHaveLength(1) // Still one root page
        expect(result[0]?.children).toHaveLength(1) // But now it has a child
        expect(result[0]?.children[0]).toEqual(
          expect.objectContaining({
            title: 'Child Page',
            isNew: true,
          }),
        )
      })

      it('should return unchanged structure when no unmapped files', () => {
        // Arrange
        const existingStructure: ProcessedPage[] = [
          {
            id: 'page1',
            title: 'Page 1',
            slug: 'page1',
            order: 1,
            hidden: false,
            localPath: 'docs/page1.md',
            children: [],
          },
        ]

        const unmappedFiles = new Map()

        // Act
        const result = treeBuilder.integrateUnmappedFiles(existingStructure, unmappedFiles)

        // Assert
        expect(result).toEqual(existingStructure)
        expect(result).toHaveLength(1)
      })
    })

    describe('createProcessingResult', () => {
      it('should create properly formatted lockfile data', () => {
        // Arrange
        const mockCategory = {
          _id: 'cat123',
          title: 'React SDK',
          slug: 'react-sdk',
          order: 1,
        }

        const mockStructure: ProcessedPage[] = [
          {
            id: 'page1',
            title: 'Page 1',
            slug: 'page1',
            order: 1,
            hidden: false,
            localPath: 'docs/page1.md',
            children: [
              {
                id: 'child1',
                title: 'Child 1',
                slug: 'child1',
                order: 1,
                hidden: false,
                localPath: 'docs/child1.md',
                children: [],
              },
            ],
          },
        ]

        const startTime = Date.now() - 1000 // 1 second ago

        // Act
        const result = treeBuilder.createProcessingResult(
          mockCategory,
          mockStructure,
          2,
          5,
          startTime,
        )

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            targetCategory: 'react-sdk',
            totalCategories: 1,
            totalPages: 2,
            pagesWithChildren: 1,
            categories: [
              expect.objectContaining({
                id: 'cat123',
                title: 'React SDK',
                slug: 'react-sdk',
                totalPages: 1,
                structure: mockStructure,
              }),
            ],
            metadata: expect.objectContaining({
              apiRequestCount: 5,
              discoveredRelationships: 1,
              hierarchicalRelationships: 1,
              executionTimeMs: expect.any(Number),
            }),
          }),
        )

        expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })
    })
  })

  /**
   * LockfileGenerator Tests
   *
   * The LockfileGenerator orchestrates the complete workflow:
   * - Coordinating API client, file system handler, and tree builder
   * - Managing the complete lockfile generation process
   * - Handling errors and providing user feedback
   * - Saving results to YAML files with proper formatting
   */
  describe('LockfileGenerator', () => {
    let generator: LockfileGenerator
    let mockApiClient: ReadMeApiClient
    let mockFileSystemHandler: FileSystemHandler
    let mockTreeBuilder: DocumentTreeBuilder

    beforeEach(() => {
      vi.clearAllMocks()
      mockProcessExit.mockClear()
      mockConsoleLog.mockClear()
      mockConsoleError.mockClear()

      // Set up environment
      process.env.README_API_KEY = 'test-key'
      process.env.DOCS_CHECK_UPDATE_STATUS = 'true'

      // Create mocks
      mockApiClient = {
        getCategories: vi.fn(),
        getCategoryPages: vi.fn(),
        fetchAllPageDetails: vi.fn(),
        getRequestCount: vi.fn().mockReturnValue(5),
      } as any

      mockFileSystemHandler = {
        scanLocalFiles: vi.fn(),
        ensureDirectory: vi.fn(),
        writeYamlFile: vi.fn(),
      } as any

      mockTreeBuilder = {
        buildDocumentTree: vi.fn(),
        findUnmappedFiles: vi.fn(),
        integrateUnmappedFiles: vi.fn(),
        createProcessingResult: vi.fn(),
      } as any

      generator = new LockfileGenerator(mockApiClient, mockFileSystemHandler, mockTreeBuilder)
    })

    describe('generateLockfile', () => {
      it('should execute complete workflow successfully', async () => {
        // Arrange
        const mockCategory = { _id: 'cat1', title: 'React SDK', slug: 'react-sdk' }
        const mockPages = [{ id: 'page1', title: 'Page 1', slug: 'page1', children: [] }]
        const mockLocalFiles = new Map([['page1', { localPath: 'docs/page1.md' } as LocalFileInfo]])
        const mockAllPages = new Map([['page1', mockPages[0]!]])
        const mockUnmappedFiles = new Map()
        const mockDocumentTree = [{ id: 'page1', title: 'Page 1', children: [] }]
        const mockResult = { timestamp: '2024-01-01', totalPages: 1 }

        vi.mocked(mockApiClient.getCategories).mockResolvedValue([mockCategory] as any)
        vi.mocked(mockApiClient.getCategoryPages).mockResolvedValue(mockPages as any)
        vi.mocked(mockApiClient.fetchAllPageDetails).mockResolvedValue({ errors: 0 })
        vi.mocked(mockFileSystemHandler.scanLocalFiles).mockReturnValue(mockLocalFiles)
        vi.mocked(mockTreeBuilder.buildDocumentTree).mockReturnValue(mockDocumentTree as any)
        vi.mocked(mockTreeBuilder.findUnmappedFiles).mockReturnValue(mockUnmappedFiles)
        vi.mocked(mockTreeBuilder.integrateUnmappedFiles).mockReturnValue(mockDocumentTree as any)
        vi.mocked(mockTreeBuilder.createProcessingResult).mockReturnValue(mockResult as any)

        // Mock ReadMeApiClient.extractAllPages static method
        vi.spyOn(ReadMeApiClient, 'extractAllPages').mockReturnValue(mockAllPages)

        // Act
        const result = await generator.generateLockfile()

        // Assert
        expect(result).toEqual(mockResult)
        expect(mockApiClient.getCategories).toHaveBeenCalled()
        expect(mockApiClient.getCategoryPages).toHaveBeenCalledWith('react-sdk')
        expect(mockFileSystemHandler.scanLocalFiles).toHaveBeenCalled()
        expect(mockTreeBuilder.buildDocumentTree).toHaveBeenCalled()
      })

      it('should throw error when react-sdk category not found', async () => {
        // Arrange
        const mockCategories = [{ _id: 'other', title: 'Other', slug: 'other' }]
        vi.mocked(mockApiClient.getCategories).mockResolvedValue(mockCategories as any)

        // Act & Assert
        await expect(generator.generateLockfile()).rejects.toThrow(
          "Category 'react-sdk' not found in ReadMe",
        )
      })

      it('should handle API errors during generation', async () => {
        // Arrange
        vi.mocked(mockApiClient.getCategories).mockRejectedValue(new Error('API Error'))

        // Act & Assert
        await expect(generator.generateLockfile()).rejects.toThrow('API Error')
        expect(mockConsoleError).toHaveBeenCalledWith('Lockfile generation failed:', 'API Error')
      })

      it('should skip page details when DOCS_CHECK_UPDATE_STATUS is false', async () => {
        // Arrange
        process.env.DOCS_CHECK_UPDATE_STATUS = 'false'

        const mockCategory = { _id: 'cat1', title: 'React SDK', slug: 'react-sdk' }
        const mockPages = [{ id: 'page1', title: 'Page 1', slug: 'page1', children: [] }]
        const mockLocalFiles = new Map()
        const mockAllPages = new Map([['page1', mockPages[0]!]])

        vi.mocked(mockApiClient.getCategories).mockResolvedValue([mockCategory] as any)
        vi.mocked(mockApiClient.getCategoryPages).mockResolvedValue(mockPages as any)
        vi.mocked(mockFileSystemHandler.scanLocalFiles).mockReturnValue(mockLocalFiles)
        vi.mocked(mockTreeBuilder.buildDocumentTree).mockReturnValue([])
        vi.mocked(mockTreeBuilder.findUnmappedFiles).mockReturnValue(new Map())
        vi.mocked(mockTreeBuilder.integrateUnmappedFiles).mockReturnValue([])
        vi.mocked(mockTreeBuilder.createProcessingResult).mockReturnValue({} as any)

        vi.spyOn(ReadMeApiClient, 'extractAllPages').mockReturnValue(mockAllPages)

        // Act
        await generator.generateLockfile()

        // Assert
        expect(mockApiClient.fetchAllPageDetails).not.toHaveBeenCalled()
        expect(mockTreeBuilder.buildDocumentTree).toHaveBeenCalledWith(
          mockPages,
          mockLocalFiles,
          mockFileSystemHandler,
          undefined, // No detailed pages when update check disabled
        )
      })
    })

    describe('saveResult', () => {
      it('should save YAML file with proper formatting', () => {
        // Arrange
        const mockResult: LockfileData = {
          timestamp: '2024-01-01T00:00:00.000Z',
          targetCategory: 'react-sdk',
          totalCategories: 1,
          totalPages: 1,
          pagesWithChildren: 0,
          categories: [],
          metadata: {
            apiRequestCount: 5,
            discoveredRelationships: 1,
            hierarchicalRelationships: 0,
            executionTimeMs: 1000,
          },
        }

        const mockYamlContent = 'timestamp: 2024-01-01T00:00:00.000Z'
        mockYamlDump.mockReturnValue(mockYamlContent)

        // Act
        generator.saveResult(mockResult)

        // Assert
        expect(mockFileSystemHandler.ensureDirectory).toHaveBeenCalledWith('.docs')
        expect(mockYamlDump).toHaveBeenCalledWith(mockResult, {
          indent: 2,
          lineWidth: 120,
          noRefs: true,
          sortKeys: false,
        })
        expect(mockFileSystemHandler.writeYamlFile).toHaveBeenCalledWith(
          '.docs/docs-lock.yml',
          mockYamlContent,
        )
        expect(mockConsoleLog).toHaveBeenCalledWith('✓ Saved docs-lock.yml (1 pages)')
      })

      it('should handle file write errors', () => {
        // Arrange
        const mockResult = { totalPages: 1 } as LockfileData
        mockYamlDump.mockReturnValue('test content')
        vi.mocked(mockFileSystemHandler.writeYamlFile).mockImplementation(() => {
          throw new Error('Failed to write file .docs/docs-lock.yml: Write failed')
        })

        // Act & Assert
        expect(() => generator.saveResult(mockResult)).toThrow(
          'Failed to write file .docs/docs-lock.yml: Write failed',
        )
      })
    })

    describe('constructor error handling', () => {
      it('should throw error when README_API_KEY is missing', () => {
        // Arrange
        delete process.env.README_API_KEY

        // Act & Assert
        expect(() => new LockfileGenerator()).toThrow(
          'README_API_KEY environment variable is required',
        )
      })

      it('should use provided dependencies instead of creating new ones', () => {
        // Arrange & Act
        const generator = new LockfileGenerator(
          mockApiClient,
          mockFileSystemHandler,
          mockTreeBuilder,
        )

        // Assert - No direct way to test this, but should not throw errors
        expect(generator).toBeInstanceOf(LockfileGenerator)
      })
    })
  })
})

// Test utilities for future implementation
export const testHelpers = {
  createMockReadMePage: (overrides: Partial<ReadMePage> = {}): ReadMePage => ({
    id: 'test-id',
    title: 'Test Page',
    slug: 'test-page',
    order: 1,
    hidden: false,
    children: [],
    ...overrides,
  }),

  createMockLocalFileInfo: (overrides: Partial<LocalFileInfo> = {}): LocalFileInfo => ({
    localPath: 'docs/test.md',
    title: 'Test File',
    modifiedAt: new Date('2024-01-01T00:00:00.000Z'),
    parentPath: undefined,
    ...overrides,
  }),

  createMockProcessedPage: (overrides: Partial<ProcessedPage> = {}): ProcessedPage => ({
    id: 'test-id',
    title: 'Test Page',
    slug: 'test-slug',
    order: 1,
    hidden: false,
    localPath: 'docs/test.md',
    children: [],
    ...overrides,
  }),

  mockFileSystem: {
    setupDirectoryStructure: (structure: Record<string, any>) => {
      mockReaddir.mockImplementation(async (path: any) => {
        const pathKey = path.toString()
        if (structure[pathKey]) {
          return structure[pathKey]
        }
        throw new Error(`Directory not found: ${path}`)
      })
    },

    setupFileContent: (filePath: string, content: string, stats?: any) => {
      mockReadFileSync.mockImplementation((path: any) => {
        if (path === filePath) return content
        throw new Error(`File not found: ${path}`)
      })

      if (stats) {
        mockStatSync.mockImplementation((path: any) => {
          if (path === filePath) return stats
          throw new Error(`File not found: ${path}`)
        })
      }
    },
  },

  mockReadMeApi: {
    setupSuccessfulResponse: (data: any) => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
      })
    },

    setupErrorResponse: (status: number, message: string) => {
      mockFetch.mockResolvedValue({
        ok: false,
        status,
        text: () => Promise.resolve(message),
      })
    },

    setupNetworkError: (message: string) => {
      mockFetch.mockRejectedValue(new Error(message))
    },
  },
}
