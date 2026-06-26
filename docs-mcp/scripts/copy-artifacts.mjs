#!/usr/bin/env node
// Copies MCP artifacts from docs-site/build/mcp/ into docs-mcp/artifacts/ so
// they get bundled into the published npm package. Builds the docs-site
// first if the artifacts aren't already there — keeps the dev/CI command
// (`npm run build` in docs-mcp/) self-contained.
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..')
const docsSiteDir = resolve(repoRoot, 'docs-site')
const sourceDir = resolve(docsSiteDir, 'build', 'mcp')
const targetDir = resolve(__dirname, '..', 'artifacts')

const ARTIFACTS = ['docs.json', 'search-index.json', 'manifest.json']

function buildDocsSite() {
  console.log('[docs-mcp] No artifacts found — running docs-site build...')
  execSync('npm run build', { cwd: docsSiteDir, stdio: 'inherit' })
}

function ensureArtifactsExist() {
  const missing = ARTIFACTS.filter(name => !existsSync(resolve(sourceDir, name)))
  if (missing.length === 0) return
  buildDocsSite()
  const stillMissing = ARTIFACTS.filter(name => !existsSync(resolve(sourceDir, name)))
  if (stillMissing.length > 0) {
    throw new Error(`docs-site build did not produce: ${stillMissing.join(', ')}`)
  }
}

function copyArtifacts() {
  mkdirSync(targetDir, { recursive: true })
  for (const name of ARTIFACTS) {
    const src = resolve(sourceDir, name)
    const dest = resolve(targetDir, name)
    copyFileSync(src, dest)
    const { size } = statSync(dest)
    console.log(`[docs-mcp] Copied ${name} (${(size / 1024 / 1024).toFixed(2)} MB)`)
  }
}

ensureArtifactsExist()
copyArtifacts()
console.log(`[docs-mcp] Artifacts ready in ${targetDir}`)
