#!/usr/bin/env node

import type { IncomingMessage, ServerResponse } from 'http'
/* eslint-disable no-console */
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { join, extname, resolve } from 'path'
import * as yaml from 'js-yaml'
// Simple environment variable handling
import type {
  DocsLockPage,
  DocsLockCategory,
  DocsLockData,
  PreviewPage,
  DocsStructure,
} from './types'

// Simple port configuration
const port = parseInt(process.env.DOCS_PORT || '3001', 10)

// No caching for local development

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

// Transform ReadMe structure to preview format (hierarchical)
function transformPageToPreview(page: DocsLockPage): PreviewPage {
  const previewPage: PreviewPage = {
    title: page.title,
    file: page.localPath?.replace(/^\//, '') || '', // Remove leading slash
    prodUrl: page.slug || page.title.toLowerCase().replace(/\s+/g, '-'),
    order: page.order ?? 999,
    readmeId: page.id || null,
    isNew: page.isNew || false,
    hidden: page.hidden || false,
    children: [], // Will be populated by transformChildren
  }

  return previewPage
}

// Recursively transform children while preserving hierarchy
function transformChildren(pages: DocsLockPage[]): PreviewPage[] {
  if (pages.length === 0) return []

  return pages
    .sort((a, b) => {
      // Sort by order, then by title
      if (a.order !== b.order) return (a.order ?? 999) - (b.order ?? 999)
      return a.title.localeCompare(b.title)
    })
    .map(page => {
      const transformedPage = transformPageToPreview(page)
      // Recursively transform children
      transformedPage.children = transformChildren(page.children)
      return transformedPage
    })
}

// Load and parse docs-lock.yml
async function loadDocsLock(): Promise<DocsLockData> {
  try {
    const lockContent = await readFile('.docs/docs-lock.yml', 'utf8')
    const lockData = yaml.load(lockContent) as DocsLockData
    return lockData
  } catch (error) {
    console.error('docs-lock.yml not found. Run: npm run docs:lockfile')
    throw new Error('docs-lock.yml not found or invalid')
  }
}

// Transform docs-lock.yml to hierarchical preview format
async function transformDocsLock(): Promise<DocsStructure> {
  const lockData = await loadDocsLock()

  if (lockData.categories.length === 0) {
    throw new Error('No categories found in docs-lock.yml')
  }

  const category = lockData.categories[0] // React SDK category
  if (!category) {
    throw new Error('First category is undefined in docs-lock.yml')
  }

  // Transform the hierarchical structure while preserving the tree
  const sections = transformChildren(category.structure)

  return {
    sections, // Return hierarchical sections instead of flat pages
    metadata: {
      timestamp: lockData.timestamp,
      totalPages: lockData.totalPages,
      pagesWithChildren: lockData.pagesWithChildren,
      lastUpdated: new Date().toISOString(),
    },
  }
}

// Simple docs discovery using docs-lock.yml (no caching for local dev)
async function discoverDocs(): Promise<PreviewPage[]> {
  try {
    const docsStructure = await transformDocsLock()
    return docsStructure.sections
  } catch (error) {
    console.error('Failed to load docs:', (error as Error).message)
    // Return empty array as fallback
    return []
  }
}

function isSecurePath(filePath: string): boolean {
  return resolve(filePath).startsWith(resolve('.'))
}

function shouldServeHTML(pathname: string): boolean {
  return (
    pathname === '/' ||
    ((pathname.startsWith('/docs/') || pathname.startsWith('/src/')) && !pathname.endsWith('.md'))
  )
}

// Removed ETag generation since we're not caching for local development

// Simple file serving without caching (local development)
async function serveFile(filePath: string, res: ServerResponse): Promise<void> {
  // Read file
  const data = await readFile(filePath)
  const ext = extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  res.writeHead(200, { 'Content-Type': mimeType })
  res.end(data)
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  let pathname: string

  try {
    const url = new URL(req.url!, `http://localhost:${port}`)
    pathname = url.pathname
  } catch (error) {
    // Invalid URL - treat as potential security issue
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('403 Forbidden')
    return
  }

  // Early security check for non-API paths
  if (!pathname.startsWith('/api/')) {
    try {
      // Determine file to serve for security check
      let checkPath = pathname
      if (shouldServeHTML(pathname)) {
        checkPath = '/.docs/src/preview/index.html'
      }

      const filePath = join('.', checkPath)

      // Security check - moved outside main try block to avoid being caught by general error handler
      if (!isSecurePath(filePath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' })
        res.end('403 Forbidden')
        return
      }
    } catch (error) {
      // Path manipulation error - treat as security issue
      res.writeHead(403, { 'Content-Type': 'text/plain' })
      res.end('403 Forbidden')
      return
    }
  }

  try {
    // API endpoint
    if (pathname === '/api/docs') {
      const docsStructure = await discoverDocs()
      const jsonData = JSON.stringify(docsStructure)

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(jsonData)
      return
    }

    // Default document endpoint - returns the first document to load on root
    if (pathname === '/api/default') {
      try {
        const docsStructure = await discoverDocs()

        // Find the first document with a file (recursively)
        const findFirstDocument = (sections: PreviewPage[]): PreviewPage | null => {
          if (sections.length === 0) return null

          for (const section of sections) {
            if (section.file) return section

            if (section.children.length > 0) {
              const childDoc = findFirstDocument(section.children)
              if (childDoc) return childDoc
            }
          }

          return null
        }

        const defaultDoc = findFirstDocument(docsStructure)

        if (defaultDoc) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify(defaultDoc))
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: 'No default document found' }))
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(
          JSON.stringify({
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          }),
        )
      }
      return
    }

    // Health check endpoint
    if (pathname === '/api/health') {
      try {
        const lockData = await loadDocsLock()
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(
          JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            docsLockTimestamp: lockData.timestamp,
            totalPages: lockData.totalPages,
          }),
        )
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(
          JSON.stringify({
            status: 'error',
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          }),
        )
      }
      return
    }

    // Determine file to serve
    if (shouldServeHTML(pathname)) {
      pathname = '/.docs/src/preview/index.html'
    }

    const filePath = join('.', pathname)

    // Security check already done outside try block
    // Serve file with caching
    await serveFile(filePath, res)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
    } else {
      console.error('Server error:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('500 Internal Server Error')
    }
  }
}

// Function to start the server (called only when this module is run directly)
function startServer(): void {
  const server = createServer(handleRequest)

  server.listen(port, async () => {
    console.log(`Docs preview: http://localhost:${port}`)

    // Validate docs-lock.yml on startup
    try {
      const lockData = await loadDocsLock()
      console.log(`Loaded ${lockData.totalPages} pages`)
      await discoverDocs()
    } catch (error) {
      console.error(`Warning: ${(error as Error).message}`)
    }
  })

  server.on('error', error => {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} in use. Try: DOCS_PORT=3002 npm run docs:preview`)
    } else {
      console.error('Server error:', error)
    }
    process.exit(1)
  })

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...')
    server.close(() => {
      process.exit(0)
    })
  })
}

// Only start the server if this module is run directly (not imported for testing)
if (!process.env.VITEST) {
  startServer()
}

// Export functions for testing
export {
  transformPageToPreview,
  transformChildren,
  loadDocsLock,
  transformDocsLock,
  discoverDocs,
  isSecurePath,
  shouldServeHTML,
  serveFile,
  handleRequest,
}

export type { DocsLockPage, DocsLockCategory, DocsLockData, PreviewPage, DocsStructure }
