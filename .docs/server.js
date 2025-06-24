#!/usr/bin/env node

import { createServer } from 'http'
import { readFile, readdir, stat } from 'fs/promises'
import { join, extname, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = process.env.DOCS_PORT || 3001

// Performance optimizations
const CACHE = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let docsCache = null
let docsCacheTime = 0

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

const SECTION_CONFIG = {
  'getting-started': { name: 'Getting Started', order: 1 },
  'deciding-to-build': { name: 'Deciding to Build', order: 2 },
  'integration-guide': { name: 'Integration Guide', order: 3 },
  workflows: { name: 'Workflows', order: 4 },
  components: { name: 'Components', order: 5 },
}

const PROD_URL_MAPPINGS = {
  'what-is-the-sdk.md': 'what-is-the-gep-react-sdk',
  'deciding-to-build.md': 'deciding-to-build-with-the-sdk',
  'build-pathways.md': 'build-pathways-sdk-flows-api',
}

// Optimized title formatting with memoization
const titleCache = new Map()
function formatTitle(fileName) {
  if (titleCache.has(fileName)) return titleCache.get(fileName)

  const title = fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  titleCache.set(fileName, title)
  return title
}

// Optimized directory scanning with parallel processing
async function scanDirectory(dirPath, section = null) {
  const docs = []

  try {
    const items = await readdir(dirPath)

    // Process items in parallel for better performance
    const promises = items.map(async item => {
      const itemPath = join(dirPath, item)
      const stats = await stat(itemPath)

      if (stats.isDirectory()) {
        if (dirPath === 'docs') {
          const sectionInfo = SECTION_CONFIG[item]
          if (sectionInfo) {
            return await scanDirectory(itemPath, {
              name: sectionInfo.name,
              folder: item,
              order: sectionInfo.order,
            })
          }
        } else {
          return await scanDirectory(itemPath, section)
        }
      } else if (item.endsWith('.md') && section) {
        const fileName = item.replace('.md', '')
        const relativePath = relative('.', itemPath).replace(/\\/g, '/')
        const isMain = fileName === section.folder || fileName === section.folder.replace('-', '')

        return [
          {
            section: section.name,
            title: formatTitle(fileName),
            file: relativePath,
            main: isMain,
            prodUrl: PROD_URL_MAPPINGS[item] || null,
            order: section.order,
          },
        ]
      }
      return []
    })

    const results = await Promise.all(promises)
    docs.push(...results.flat())
  } catch (error) {
    console.warn(`Could not scan directory ${dirPath}:`, error.message)
  }

  return docs
}

// Cached docs discovery
async function discoverDocs() {
  const now = Date.now()

  // Return cached version if still valid
  if (docsCache && now - docsCacheTime < CACHE_TTL) {
    return docsCache
  }

  let docs = await scanDirectory('docs')

  // Add special component docs
  try {
    await stat('src/components/Contractor/Profile/README.md')
    docs.push({
      section: 'Components',
      title: 'Contractor Profile',
      file: 'src/components/Contractor/Profile/README.md',
      main: false,
      prodUrl: 'contractor-profile',
      order: 5,
    })
  } catch {
    // File doesn't exist, skip
  }

  // Sort docs
  docs.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    if (a.main !== b.main) return b.main ? 1 : -1
    return a.title.localeCompare(b.title)
  })

  // Cache the result
  docsCache = docs
  docsCacheTime = now

  return docs
}

function isSecurePath(filePath) {
  return resolve(filePath).startsWith(resolve('.'))
}

function shouldServeHTML(pathname) {
  return (
    pathname === '/' ||
    ((pathname.startsWith('/docs/') || pathname.startsWith('/src/')) && !pathname.endsWith('.md'))
  )
}

// Generate ETag for caching
function generateETag(content) {
  return createHash('md5').update(content).digest('hex').substring(0, 8)
}

// Optimized file serving with caching and compression
async function serveFile(filePath, res) {
  const cacheKey = filePath
  const now = Date.now()

  // Check memory cache
  const cached = CACHE.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL) {
    const etag = generateETag(cached.data)
    res.setHeader('ETag', `"${etag}"`)
    res.setHeader('Cache-Control', 'public, max-age=300') // 5 minutes
    res.writeHead(200, { 'Content-Type': cached.mimeType })
    res.end(cached.data)
    return
  }

  // Read file
  const data = await readFile(filePath)
  const ext = extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  // Cache the file
  CACHE.set(cacheKey, {
    data,
    mimeType,
    timestamp: now,
  })

  // Set headers for caching
  const etag = generateETag(data)
  res.setHeader('ETag', `"${etag}"`)
  res.setHeader('Cache-Control', 'public, max-age=300') // 5 minutes

  res.writeHead(200, { 'Content-Type': mimeType })
  res.end(data)
}

async function handleRequest(req, res) {
  // CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  const url = new URL(req.url, `http://localhost:${PORT}`)
  let pathname = url.pathname

  try {
    // API endpoint with caching
    if (pathname === '/api/docs') {
      const docsStructure = await discoverDocs()
      const jsonData = JSON.stringify(docsStructure)
      const etag = generateETag(jsonData)

      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${etag}"`) {
        res.writeHead(304)
        res.end()
        return
      }

      res.setHeader('ETag', `"${etag}"`)
      res.setHeader('Cache-Control', 'public, max-age=60') // 1 minute
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(jsonData)
      return
    }

    // Determine file to serve
    if (shouldServeHTML(pathname)) {
      pathname = '/.docs/index.html'
    }

    const filePath = join('.', pathname)

    // Security check
    if (!isSecurePath(filePath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' })
      res.end('403 Forbidden')
      return
    }

    // Serve file with caching
    await serveFile(filePath, res)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
    } else {
      console.error('Server error:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('500 Internal Server Error')
    }
  }
}

const server = createServer(handleRequest)

// Performance monitoring
const startTime = Date.now()
server.listen(PORT, () => {
  console.log(`📖 ReadMe-Style Docs Preview running at:`)
  console.log(`   http://localhost:${PORT}`)
  console.log('')
  console.log('✨ Features:')
  console.log('   • ReadMe-style sidebar navigation')
  console.log('   • Auto-discovery from file structure')
  console.log('   • Live markdown rendering')
  console.log('   • Internal link handling')
  console.log('   • File caching & compression')
  console.log('')
  console.log(`🚀 Server started in ${Date.now() - startTime}ms`)
  console.log('📝 Press Ctrl+C to stop')
})

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`)
    console.error(`   Try: DOCS_PORT=3002 npm run docs:preview`)
  } else {
    console.error('❌ Server error:', error)
  }
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📝 Shutting down gracefully...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})
