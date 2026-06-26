#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpDocsServer } from 'docusaurus-plugin-mcp-server'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// docusaurus-plugin-mcp-server's public surface is HTTP-only (createNodeServer,
// createWebRequestHandler). createMcpServer is typed `private` but is the
// integration point those adapters use internally — we connect it to stdio
// instead. Pinning a single plugin version keeps this stable.
interface InternalMcpDocsServer {
  initialize(): Promise<void>
  createMcpServer(): McpServer
}

// docusaurus-plugin-mcp-server ships HTTP adapters (createNodeServer,
// createWebRequestHandler) but not stdio. We bypass them and connect its
// internal McpServer — built via McpDocsServer.createMcpServer() — directly
// to StdioServerTransport. The docs.json + search-index.json artifacts come
// from `npm run build` in docs-site/; this CLI just wraps them.

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveArtifactsDir(): string {
  // Override for local dev — point at docs-site/build/mcp/ between rebuilds
  // without copying files around.
  const override = process.env.GUSTO_SDK_DOCS_MCP_ARTIFACTS
  if (override) {
    if (!existsSync(override)) {
      throw new Error(
        `GUSTO_SDK_DOCS_MCP_ARTIFACTS points at ${override} but the directory does not exist.`,
      )
    }
    return override
  }

  // Bundled artifacts shipped with the npm package. Production path.
  const bundled = resolve(__dirname, '..', 'artifacts')
  if (existsSync(bundled)) {
    return bundled
  }

  throw new Error(
    'Could not locate MCP artifacts. Run `npm run build` in docs-mcp/ (which copies ' +
      'them from docs-site/build/mcp/), or set GUSTO_SDK_DOCS_MCP_ARTIFACTS to a directory ' +
      'containing docs.json and search-index.json.',
  )
}

async function main() {
  const artifactsDir = resolveArtifactsDir()
  const docsPath = resolve(artifactsDir, 'docs.json')
  const indexPath = resolve(artifactsDir, 'search-index.json')

  for (const path of [docsPath, indexPath]) {
    if (!existsSync(path)) {
      throw new Error(`Missing artifact: ${path}`)
    }
  }

  // All log output must go to stderr — stdout is the MCP transport channel.
  console.error(`[gusto-sdk-docs-mcp] Loading artifacts from ${artifactsDir}`)

  const docsServer = new McpDocsServer({
    name: 'gusto-embedded-sdk-docs',
    version: '1.0.0',
    docsPath,
    indexPath,
    instructions:
      'Search and fetch documentation for the Gusto Embedded React SDK ' +
      '(@gusto/embedded-react-sdk). Use docs_search to find pages by topic, ' +
      'then docs_fetch with the returned URL to read full content.',
  })

  const internal = docsServer as unknown as InternalMcpDocsServer
  await internal.initialize()
  const mcpServer = internal.createMcpServer()
  const transport = new StdioServerTransport()
  await mcpServer.connect(transport)
  console.error('[gusto-sdk-docs-mcp] Connected over stdio. Ready.')
}

main().catch(error => {
  console.error('[gusto-sdk-docs-mcp] Fatal error:', error)
  process.exit(1)
})
