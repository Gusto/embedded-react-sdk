import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'docs')

const REQUIRED_FIELDS = ['title', 'description'] as const
type RequiredField = (typeof REQUIRED_FIELDS)[number]

interface Violation {
  file: string
  reason: string
}

function collectMarkdownFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectMarkdownFiles(full))
    } else if (entry.endsWith('.md')) {
      out.push(full)
    }
  }
  return out.sort()
}

function extractFrontmatter(source: string): string | null {
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) return null
  const closing = source.indexOf('\n---', 4)
  if (closing === -1) return null
  return source.slice(source.indexOf('\n') + 1, closing)
}

function hasNonEmptyField(frontmatter: string, field: RequiredField): boolean {
  const pattern = new RegExp(`^${field}:[ \\t]*(.+?)[ \\t]*$`, 'm')
  const match = frontmatter.match(pattern)
  if (!match) return false
  const value = match[1]!.replace(/^['"]|['"]$/g, '').trim()
  return value.length > 0
}

function lint(files: string[]): Violation[] {
  const violations: Violation[] = []
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const frontmatter = extractFrontmatter(source)
    const rel = relative(ROOT, file)
    if (frontmatter === null) {
      violations.push({ file: rel, reason: 'missing YAML front matter block' })
      continue
    }
    for (const field of REQUIRED_FIELDS) {
      if (!hasNonEmptyField(frontmatter, field)) {
        violations.push({ file: rel, reason: `missing or empty \`${field}:\`` })
      }
    }
  }
  return violations
}

const files = collectMarkdownFiles(DOCS_DIR)
const violations = lint(files)

if (violations.length > 0) {
  console.error(
    `✗ Front matter lint failed (${violations.length} issue(s) across ${files.length} file(s)):\n`,
  )
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.reason}`)
  }
  console.error(
    `\nEvery docs/**/*.md must have non-empty \`title:\` and \`description:\` in its YAML front matter.`,
  )
  process.exit(1)
}

console.log(`✓ Front matter valid: ${files.length} files checked`)
