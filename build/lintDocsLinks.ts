import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'docs')

const INLINE_LINK = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g
const REFERENCE_DEFINITION = /^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+["'(].*)?$/

interface BrokenLink {
  file: string
  line: number
  target: string
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

function isRelativeFileTarget(target: string): boolean {
  return !/^([a-z][a-z0-9+.-]*:|#|\/|\/\/)/i.test(target)
}

function extractTargets(line: string): string[] {
  const targets = Array.from(line.matchAll(INLINE_LINK), match => match[1] ?? '')
  const definition = REFERENCE_DEFINITION.exec(line)
  if (definition?.[1]) targets.push(definition[1])
  return targets
}

function targetExists(fromFile: string, target: string): boolean {
  const pathOnly = decodeURIComponent(target.split(/[#?]/)[0] ?? '')
  if (pathOnly === '') return true
  const resolved = resolve(dirname(fromFile), pathOnly)
  if (existsSync(resolved) && statSync(resolved).isFile()) return true
  return [`${resolved}.md`, join(resolved, 'index.md'), join(resolved, 'README.md')].some(
    candidate => existsSync(candidate),
  )
}

function findBrokenLinks(file: string): BrokenLink[] {
  const broken: BrokenLink[] = []
  let inFence = false
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return
      }
      if (inFence) return
      for (const target of extractTargets(line)) {
        if (isRelativeFileTarget(target) && !targetExists(file, target)) {
          broken.push({ file: relative(ROOT, file), line: index + 1, target })
        }
      }
    })
  return broken
}

const files = collectMarkdownFiles(DOCS_DIR)
const broken = files.flatMap(findBrokenLinks)

if (broken.length > 0) {
  console.error(`✗ Broken relative links (${broken.length} across ${files.length} file(s)):\n`)
  for (const { file, line, target } of broken) {
    console.error(`  ${file}:${line} -> ${target}`)
  }
  console.error('\nThe docs site build treats broken links as errors, so these would fail it.')
  process.exit(1)
}

console.log(`✓ Relative links valid: ${files.length} files checked`)
