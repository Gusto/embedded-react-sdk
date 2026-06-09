import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { parse as parseYaml } from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'docs')
const REQUIRED_FIELDS = ['title', 'description'] as const

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
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match ? match[1]! : null
}

function lintFile(file: string): string[] {
  const source = readFileSync(file, 'utf8')
  const frontmatter = extractFrontmatter(source)
  if (frontmatter === null) return ['missing YAML front matter block']

  let data: Record<string, unknown>
  try {
    const parsed: unknown = parseYaml(frontmatter)
    data = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch (err) {
    return [`invalid YAML front matter: ${err instanceof Error ? err.message : String(err)}`]
  }

  const reasons: string[] = []
  for (const field of REQUIRED_FIELDS) {
    const value = data[field]
    const isNonEmpty = typeof value === 'string' ? value.trim().length > 0 : value != null
    if (!isNonEmpty) reasons.push(`missing or empty \`${field}:\``)
  }
  return reasons
}

const files = collectMarkdownFiles(DOCS_DIR)
const violations: Violation[] = files.flatMap(file =>
  lintFile(file).map(reason => ({ file: relative(ROOT, file), reason })),
)

if (violations.length > 0) {
  console.error(
    `✗ Front matter lint failed (${violations.length} issue(s) across ${files.length} file(s)):\n`,
  )
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.reason}`)
  }
  console.error(
    `\nEvery docs/**/*.md must have non-empty ${REQUIRED_FIELDS.map(f => `\`${f}:\``).join(' + ')} in its YAML front matter.`,
  )
  process.exit(1)
}

console.log(`✓ Front matter valid: ${files.length} files checked`)
