/**
 * PREVIEW SERVER TESTS
 *
 * Tests for the documentation preview server that:
 * - Serves API endpoints for docs structure and health checks
 * - Handles file serving with correct MIME types and security
 * - Validates lockfile structure and navigation consistency
 * - Ensures proper integration between lockfile data and preview functionality
 * - Tests frontmatter stripping and document loading workflows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFile } from 'fs/promises'
import * as yaml from 'js-yaml'
import type { IncomingMessage, ServerResponse } from 'http'

import {
  transformPageToPreview,
  transformChildren,
  loadDocsLock,
  transformDocsLock,
  discoverDocs,
  isSecurePath,
  shouldServeHTML,
  serveFile,
  handleRequest,
  type DocsLockPage,
  type DocsLockData,
} from '../server'

// Mock dependencies
vi.mock('fs/promises')
vi.mock('js-yaml')

const mockReadFile = vi.mocked(readFile)
const mockYamlLoad = vi.mocked(yaml.load)
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Preview Server', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Transformation', () => {
    it('should transform page correctly', () => {
      const lockPage: DocsLockPage = {
        id: 'page1',
        title: 'Getting Started',
        slug: 'getting-started',
        order: 1,
        hidden: false,
        localPath: '/docs/getting-started.md',
        isNew: false,
        children: [],
      }

      const result = transformPageToPreview(lockPage)

      expect(result).toEqual({
        title: 'Getting Started',
        file: 'docs/getting-started.md', // Leading slash removed
        prodUrl: 'getting-started',
        order: 1,
        readmeId: 'page1',
        isNew: false,
        hidden: false,
        children: [],
      })
    })

    it('should handle missing fields with defaults', () => {
      const lockPage: DocsLockPage = {
        title: 'Minimal Page',
        localPath: 'docs/minimal.md',
        children: [],
      }

      const result = transformPageToPreview(lockPage)

      expect(result.order).toBe(999)
      expect(result.readmeId).toBeNull()
      expect(result.isNew).toBe(false)
      expect(result.hidden).toBe(false)
    })

    it('should transform and sort children', () => {
      const lockPages: DocsLockPage[] = [
        {
          title: 'Second Page',
          order: 2,
          localPath: 'docs/second.md',
          children: [],
        },
        {
          title: 'First Page',
          order: 1,
          localPath: 'docs/first.md',
          children: [],
        },
      ]

      const result = transformChildren(lockPages)

      expect(result).toHaveLength(2)
      expect(result[0]!.title).toBe('First Page')
      expect(result[1]!.title).toBe('Second Page')
    })
  })

  describe('Lockfile Loading', () => {
    const mockLockData: DocsLockData = {
      categories: [
        {
          id: 'react-sdk',
          title: 'React SDK',
          slug: 'react-sdk',
          totalPages: 1,
          structure: [
            {
              title: 'Getting Started',
              localPath: 'docs/getting-started.md',
              children: [],
            },
          ],
        },
      ],
      timestamp: '2025-01-01T00:00:00Z',
      totalPages: 1,
      pagesWithChildren: 0,
      targetCategory: 'react-sdk',
      totalCategories: 1,
      metadata: {
        apiRequestCount: 1,
        discoveredRelationships: 0,
        hierarchicalRelationships: 0,
        executionTimeMs: 100,
      },
    }

    it('should load and parse lockfile successfully', async () => {
      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue(mockLockData)

      const result = await loadDocsLock()

      expect(result).toEqual(mockLockData)
      expect(mockReadFile).toHaveBeenCalledWith('.docs/docs-lock.yml', 'utf8')
    })

    it('should handle missing lockfile', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'))

      await expect(loadDocsLock()).rejects.toThrow('docs-lock.yml not found or invalid')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'docs-lock.yml not found. Run: npm run docs:lockfile',
      )
    })

    it('should transform lockfile to preview format', async () => {
      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue(mockLockData)

      const result = await transformDocsLock()

      expect(result.sections).toHaveLength(1)
      expect(result.sections[0]!.title).toBe('Getting Started')
      expect(result.metadata.timestamp).toBe('2025-01-01T00:00:00Z')
    })

    it('should handle empty categories', async () => {
      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue({ ...mockLockData, categories: [] })

      await expect(transformDocsLock()).rejects.toThrow('No categories found in docs-lock.yml')
    })

    it('should return empty array on discovery error', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'))

      const result = await discoverDocs()

      expect(result).toEqual([])
    })
  })

  describe('Security and File Serving', () => {
    it('should validate secure paths', () => {
      expect(isSecurePath('.docs/styles.css')).toBe(true)
      expect(isSecurePath('docs/test.md')).toBe(true)
      expect(isSecurePath('../../../etc/passwd')).toBe(false)
      expect(isSecurePath('/etc/passwd')).toBe(false)
    })

    it('should determine when to serve HTML', () => {
      expect(shouldServeHTML('/')).toBe(true)
      expect(shouldServeHTML('/docs/getting-started')).toBe(true)
      expect(shouldServeHTML('/docs/test.md')).toBe(false)
      expect(shouldServeHTML('/styles.css')).toBe(false)
    })

    it('should serve files with correct MIME types', async () => {
      const mockResponse = {
        writeHead: vi.fn(),
        end: vi.fn(),
      }

      mockReadFile.mockResolvedValue(Buffer.from('body { color: red; }'))

      await serveFile('styles.css', mockResponse as any)

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'text/css; charset=utf-8',
      })
    })
  })

  describe('Request Handling', () => {
    let mockRequest: Partial<IncomingMessage>
    let mockResponse: Partial<ServerResponse>

    beforeEach(() => {
      mockRequest = { url: '/', method: 'GET' }
      mockResponse = {
        setHeader: vi.fn(),
        writeHead: vi.fn(),
        end: vi.fn(),
      }
    })

    it('should handle /api/health endpoint', async () => {
      mockRequest.url = '/api/health'
      const mockLockData: DocsLockData = {
        categories: [
          { id: 'react-sdk', title: 'React SDK', slug: 'react-sdk', totalPages: 0, structure: [] },
        ],
        timestamp: '2025-01-01T00:00:00Z',
        totalPages: 5,
        pagesWithChildren: 2,
        targetCategory: 'react-sdk',
        totalCategories: 1,
        metadata: {
          apiRequestCount: 1,
          discoveredRelationships: 0,
          hierarchicalRelationships: 0,
          executionTimeMs: 100,
        },
      }

      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue(mockLockData)

      await handleRequest(mockRequest as IncomingMessage, mockResponse as ServerResponse)

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      const responseData = JSON.parse((mockResponse.end as any).mock.calls[0][0])
      expect(responseData.status).toBe('healthy')
      expect(responseData.totalPages).toBe(5)
    })

    it('should handle /api/docs endpoint', async () => {
      mockRequest.url = '/api/docs'
      const mockLockData: DocsLockData = {
        categories: [
          {
            id: 'react-sdk',
            title: 'React SDK',
            slug: 'react-sdk',
            totalPages: 1,
            structure: [
              { title: 'Getting Started', localPath: 'docs/getting-started.md', children: [] },
            ],
          },
        ],
        timestamp: '2025-01-01T00:00:00Z',
        totalPages: 1,
        pagesWithChildren: 0,
        targetCategory: 'react-sdk',
        totalCategories: 1,
        metadata: {
          apiRequestCount: 1,
          discoveredRelationships: 0,
          hierarchicalRelationships: 0,
          executionTimeMs: 100,
        },
      }

      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue(mockLockData)

      await handleRequest(mockRequest as IncomingMessage, mockResponse as ServerResponse)

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json; charset=utf-8',
      })

      const responseData = JSON.parse((mockResponse.end as any).mock.calls[0][0])
      expect(Array.isArray(responseData)).toBe(true)
      expect(responseData).toHaveLength(1)
    })

    it('should handle 404 for missing files', async () => {
      mockRequest.url = '/nonexistent.md'
      mockReadFile.mockRejectedValue({ code: 'ENOENT' })

      await handleRequest(mockRequest as IncomingMessage, mockResponse as ServerResponse)

      expect(mockResponse.writeHead).toHaveBeenCalledWith(404, {
        'Content-Type': 'text/plain',
      })
      expect(mockResponse.end).toHaveBeenCalledWith('404 Not Found')
    })

    it('should handle 500 for server errors', async () => {
      mockRequest.url = '/test.md'
      mockReadFile.mockRejectedValue(new Error('Disk error'))

      await handleRequest(mockRequest as IncomingMessage, mockResponse as ServerResponse)

      expect(mockResponse.writeHead).toHaveBeenCalledWith(500, {
        'Content-Type': 'text/plain',
      })
      expect(mockResponse.end).toHaveBeenCalledWith('500 Internal Server Error')
    })

    it('should set proper CORS and security headers', async () => {
      mockRequest.url = '/api/health'
      mockReadFile.mockResolvedValue('mock-yaml-content')
      mockYamlLoad.mockReturnValue({
        categories: [
          { id: 'react-sdk', title: 'React SDK', slug: 'react-sdk', totalPages: 0, structure: [] },
        ],
        timestamp: '2025-01-01T00:00:00Z',
        totalPages: 0,
        pagesWithChildren: 0,
        targetCategory: 'react-sdk',
        totalCategories: 1,
        metadata: {
          apiRequestCount: 1,
          discoveredRelationships: 0,
          hierarchicalRelationships: 0,
          executionTimeMs: 100,
        },
      })

      await handleRequest(mockRequest as IncomingMessage, mockResponse as ServerResponse)

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    })
  })
})
