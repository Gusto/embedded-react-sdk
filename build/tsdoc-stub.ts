/**
 * Generates a TSDoc skeleton for an exported symbol.
 *
 * Output format (stdout):
 *
 * No existing comment (pure insert):
 *   LINE:<n>                 — 1-based line number of the declaration; insert comment here
 *   DECLARATION:\n...\n---   — full source text of the declaration
 *   /** ... * /              — skeleton with @typeParam / @param / @returns stubs and release tag
 *
 * Existing comment without a release tag (replace):
 *   LINE:<n>                 — start line of the existing comment; insert new comment here
 *   DELETE_THROUGH:<m>       — end line of the existing comment; delete lines n–m before inserting
 *   OLD_COMMENT:\n...\n---   — text of the existing comment (use as Edit old_string prefix)
 *   DECLARATION:\n...\n---   — full source text of the declaration
 *   /** ... * /              — skeleton with summary pre-filled from the old comment
 *
 * Existing comment with a release tag: nothing emitted (stderr message, exit 0).
 *
 * The release tag is resolved from .reports/embedded-react-sdk.api.md:
 *   - Symbol present with ae-missing-release-tag warning → @public
 *   - Otherwise → --default-release value (default: alpha)
 *
 * Usage:
 *   npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release alpha|beta|public|internal]
 */

import { Project, Node, type SourceFile } from 'ts-morph'
import type {
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
  MethodDeclaration,
} from 'ts-morph'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 ? process.argv[idx + 1] : undefined
}

const filePath = getArg('--file')
const symbolName = getArg('--symbol')
const defaultRelease = getArg('--default-release') ?? 'alpha'

const VALID_RELEASE_TAGS = ['alpha', 'beta', 'public', 'internal'] as const
type ReleaseTag = (typeof VALID_RELEASE_TAGS)[number]

if (!filePath || !symbolName) {
  process.stderr.write(
    'Usage: npx tsx scripts/tsdoc-stub.ts --file <path> --symbol <name> [--default-release alpha|beta|public|internal]\n',
  )
  process.exit(1)
}

if (!VALID_RELEASE_TAGS.includes(defaultRelease as ReleaseTag)) {
  process.stderr.write(
    `Invalid --default-release "${defaultRelease}". Must be one of: ${VALID_RELEASE_TAGS.join(', ')}\n`,
  )
  process.exit(1)
}

const project = new Project({
  tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
})

const absPath = resolve(filePath)
project.addSourceFileAtPath(absPath)
const sourceFile = project.getSourceFile(absPath)

if (!sourceFile) {
  process.stderr.write(`File not found: ${filePath}\n`)
  process.exit(1)
}

const exportedDecls = sourceFile.getExportedDeclarations()
const decls = exportedDecls.get(symbolName)

if (!decls || decls.length === 0) {
  process.stderr.write(`Symbol '${symbolName}' not found as an export in ${filePath}\n`)
  process.exit(1)
}

// For function overloads, the first declaration is the implementation signature
const decl = decls[0]!

const RELEASE_TAG_PATTERN = /@(?:public|beta|alpha|internal)\b/

interface ExistingComment {
  text: string
  summary: string | null
  startLine: number
  endLine: number
}

function findExistingComment(node: Node, sf: SourceFile): ExistingComment | null {
  // Comments live on the parent VariableStatement for variable declarations
  const target = Node.isVariableDeclaration(node) ? (node.getParent()?.getParent() ?? node) : node

  const ranges = target.getLeadingCommentRanges()
  if (ranges.length === 0) return null

  // Only consider comments immediately before the declaration (≤1 blank line gap)
  const declLine = target.getStartLineNumber()
  const nearby = ranges.filter(r => {
    const endLine = sf.getLineAndColumnAtPos(r.getEnd()).line + 1
    return declLine - endLine <= 1
  })
  if (nearby.length === 0) return null

  const first = nearby[0]!
  const last = nearby[nearby.length - 1]!
  const text = nearby.map(r => r.getText()).join('\n')

  let summary: string | null = null
  const firstText = first.getText()
  if (firstText.startsWith('/*')) {
    const lines = firstText
      .replace(/^\/\*+\s*/, '')
      .replace(/\s*\*+\/$/, '')
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean)
    summary = lines.find(l => !l.startsWith('@')) ?? null
  } else {
    summary =
      nearby
        .map(r =>
          r
            .getText()
            .replace(/^\/\/\s?/, '')
            .trim(),
        )
        .filter(Boolean)
        .join(' ') || null
  }

  const startLine = sf.getLineAndColumnAtPos(first.getPos()).line + 1
  const endLine = sf.getLineAndColumnAtPos(last.getEnd() - 1).line + 1

  return { text, summary, startLine, endLine }
}

function parseCommentStructure(text: string): {
  params: string[]
  typeParams: string[]
  hasReturns: boolean
  hasReleaseTag: boolean
} {
  const params: string[] = []
  const typeParams: string[] = []
  let hasReturns = false
  let hasReleaseTag = false

  for (const line of text.split('\n')) {
    const stripped = line.replace(/^\s*(?:\/\/\s?|\*\s?)?/, '').trim()
    if (RELEASE_TAG_PATTERN.test(stripped)) hasReleaseTag = true
    const nameMatch = stripped.match(/^@(\S+)\s+(\S+)/)
    if (nameMatch?.[1] === 'param') params.push(nameMatch[2]!)
    if (nameMatch?.[1] === 'typeParam') typeParams.push(nameMatch[2]!)
    if (/^@returns?\b/.test(stripped)) hasReturns = true
  }

  return { params, typeParams, hasReturns, hasReleaseTag }
}

function isAligned(comment: ExistingComment, info: SymbolInfo): boolean {
  const { params, typeParams, hasReturns, hasReleaseTag } = parseCommentStructure(comment.text)
  return (
    hasReleaseTag &&
    info.hasReturn === hasReturns &&
    params.join(',') === info.params.join(',') &&
    typeParams.join(',') === info.typeParams.join(',')
  )
}

interface SymbolInfo {
  typeParams: string[]
  params: string[]
  hasReturn: boolean
}

function isVoidReturn(text: string): boolean {
  const trimmed = text.trim()
  return trimmed === 'void' || trimmed === 'undefined' || trimmed === 'never'
}

type FunctionLike = FunctionDeclaration | ArrowFunction | FunctionExpression | MethodDeclaration

function extractFunctionLike(node: FunctionLike): SymbolInfo {
  const typeParams = node.getTypeParameters().map(tp => tp.getName())
  const params = node.getParameters().map(p => p.getName())
  const returnTypeNode = node.getReturnTypeNode()
  const hasReturn = returnTypeNode === undefined || !isVoidReturn(returnTypeNode.getText())
  return { typeParams, params, hasReturn }
}

function extractInfo(node: Node): SymbolInfo {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return extractFunctionLike(node)
  }

  if (Node.isVariableDeclaration(node)) {
    const init = node.getInitializer()
    if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
      return extractFunctionLike(init)
    }
    return { typeParams: [], params: [], hasReturn: false }
  }

  if (
    Node.isInterfaceDeclaration(node) ||
    Node.isTypeAliasDeclaration(node) ||
    Node.isClassDeclaration(node)
  ) {
    return {
      typeParams: node.getTypeParameters().map(tp => tp.getName()),
      params: [],
      hasReturn: false,
    }
  }

  // Enums and anything else: no tags needed beyond release tag
  return { typeParams: [], params: [], hasReturn: false }
}

function resolveReleaseTag(symbolName: string, fallback: ReleaseTag): string {
  const reportPath = resolve(ROOT, '.reports/embedded-react-sdk.api.md')
  let report: string
  try {
    report = readFileSync(reportPath, 'utf8')
  } catch {
    return `@${fallback}`
  }
  const marker = `(ae-missing-release-tag) "${symbolName}"`
  return report.includes(marker) ? '@public' : `@${fallback}`
}

function buildSkeleton(
  { typeParams, params, hasReturn }: SymbolInfo,
  releaseTag: string,
  summary: string | null = null,
): string {
  const tagLines: string[] = []

  for (const tp of typeParams) {
    tagLines.push(` * @typeParam ${tp} -`)
  }
  for (const p of params) {
    tagLines.push(` * @param ${p} -`)
  }
  if (hasReturn) {
    tagLines.push(' * @returns')
  }
  tagLines.push(` * ${releaseTag}`)

  const summaryLine = summary ? ` * ${summary}` : ' *'
  return ['/**', summaryLine, ...tagLines, ' */'].join('\n')
}

const existingComment = findExistingComment(decl, sourceFile!)
const info = extractInfo(decl)

if (existingComment && isAligned(existingComment, info)) {
  process.stderr.write(`Symbol '${symbolName}' already has a TSDoc comment — skipping.\n`)
  process.exit(0)
}

const releaseTag = resolveReleaseTag(symbolName, defaultRelease as ReleaseTag)
const declarationText = decl.getText()
const skeleton = buildSkeleton(info, releaseTag, existingComment?.summary ?? null)

let output = existingComment
  ? `LINE:${existingComment.startLine}\nDELETE_THROUGH:${existingComment.endLine}\nOLD_COMMENT:\n${existingComment.text}\n---\n`
  : `LINE:${decl.getStartLineNumber()}\n`

output += `DECLARATION:\n${declarationText}\n---\n${skeleton}\n`
process.stdout.write(output)
