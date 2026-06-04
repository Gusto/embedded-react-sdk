/**
 * Core logic for TSDoc skeleton generation. Imported by tsdoc-stub.ts (CLI).
 *
 * All functions are pure or read-only — no process.exit, no stdout/stderr writes.
 */

import { Node, type SourceFile } from 'ts-morph'
import type {
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
  MethodDeclaration,
} from 'ts-morph'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const RELEASE_TAG_PATTERN = /@(?:public|beta|alpha|internal)\b/

export interface ExistingComment {
  text: string
  summary: string | null
  startLine: number
  endLine: number
}

export interface SymbolInfo {
  typeParams: string[]
  params: string[]
  hasReturn: boolean
}

// ─── Comment detection ───────────────────────────────────────────────────────

export function findExistingComment(node: Node, sf: SourceFile): ExistingComment | null {
  const target = Node.isVariableDeclaration(node) ? (node.getParent()?.getParent() ?? node) : node

  const ranges = target.getLeadingCommentRanges()
  if (ranges.length === 0) return null

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

export function parseCommentStructure(text: string): {
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

export function isAligned(comment: ExistingComment, info: SymbolInfo): boolean {
  const { params, typeParams, hasReturns, hasReleaseTag } = parseCommentStructure(comment.text)
  return (
    hasReleaseTag &&
    info.hasReturn === hasReturns &&
    params.join(',') === info.params.join(',') &&
    typeParams.join(',') === info.typeParams.join(',')
  )
}

// ─── Symbol introspection ─────────────────────────────────────────────────────

type FunctionLike = FunctionDeclaration | ArrowFunction | FunctionExpression | MethodDeclaration

function isVoidReturn(text: string): boolean {
  const trimmed = text.trim()
  return trimmed === 'void' || trimmed === 'undefined' || trimmed === 'never'
}

function extractFunctionLike(node: FunctionLike): SymbolInfo {
  const typeParams = node.getTypeParameters().map(tp => tp.getName())
  const params = node.getParameters().map(p => p.getName())
  const returnTypeNode = node.getReturnTypeNode()
  const hasReturn = returnTypeNode === undefined || !isVoidReturn(returnTypeNode.getText())
  return { typeParams, params, hasReturn }
}

export function extractInfo(node: Node): SymbolInfo {
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

  return { typeParams: [], params: [], hasReturn: false }
}

// ─── Skeleton builder ─────────────────────────────────────────────────────────

export function buildSkeleton(
  { typeParams, params, hasReturn }: SymbolInfo,
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
  tagLines.push(' * @release')

  const summaryLine = summary ? ` * ${summary}` : ' *'
  return ['/**', summaryLine, ...tagLines, ' */'].join('\n')
}

// ─── Event key discovery ──────────────────────────────────────────────────────

export function collectOnEventKeys(info: SymbolInfo, sf: SourceFile): string[] | null {
  // Types, interfaces, and enums don't emit events — only callables do
  if (info.params.length === 0 && !info.hasReturn) return null

  const fileText = sf.getFullText()

  const hasOnEventParam = info.params.some(p => p.includes('onEvent'))
  const hasDirectCalls = /onEvent\(\w+Events\./.test(fileText)
  if (!hasOnEventParam && !hasDirectCalls) return null

  const keys = new Set<string>()
  const EVENT_REF = /\w+Events\.(\w+)/g

  function scanText(text: string) {
    for (const m of text.matchAll(EVENT_REF)) {
      keys.add(m[1]!)
    }
  }

  scanText(fileText)

  // For flow components that delegate to a state machine, scan directly imported
  // relative files one level deep to pick up machine transitions.
  if (hasOnEventParam) {
    for (const imp of sf.getImportDeclarations()) {
      const spec = imp.getModuleSpecifierValue()
      if (!spec.startsWith('.')) continue
      const base = resolve(dirname(sf.getFilePath()), spec)
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const candidate = base + ext
        if (existsSync(candidate)) {
          try {
            scanText(readFileSync(candidate, 'utf8'))
          } catch {}
          break
        }
      }
    }
  }

  return keys.size > 0 ? [...keys].sort() : null
}

export function resolveEventValues(keys: string[]): Map<string, string> {
  const values = new Map<string, string>()
  try {
    const constantsText = readFileSync(resolve(ROOT, 'src/shared/constants.ts'), 'utf8')
    for (const key of keys) {
      const m = constantsText.match(new RegExp(`(?<![A-Za-z0-9_])${key}:\\s*'([^']+)'`))
      if (m?.[1]) values.set(key, m[1])
    }
  } catch {}
  return values
}

// ─── High-level entry point ───────────────────────────────────────────────────

/**
 * Generates the stub output block for one exported symbol.
 *
 * Returns the output string to write to stdout, or null if the symbol already
 * has an aligned TSDoc comment and should be skipped.
 *
 * Errors (symbol not found, declaration missing) are thrown so the CLI can
 * decide whether to exit or continue to the next symbol.
 */
export function processSymbol(symbolName: string, sourceFile: SourceFile): string | null {
  const exportedDecls = sourceFile.getExportedDeclarations()
  const decls = exportedDecls.get(symbolName)
  if (!decls || decls.length === 0) {
    throw new Error(`Symbol '${symbolName}' not found as an export in ${sourceFile.getFilePath()}`)
  }

  const decl = decls[0]!
  const existingComment = findExistingComment(decl, sourceFile)
  const info = extractInfo(decl)

  if (existingComment && isAligned(existingComment, info)) {
    return null
  }

  const declarationText = decl.getText()
  const skeleton = buildSkeleton(info, existingComment?.summary ?? null)

  let output = existingComment
    ? `LINE:${existingComment.startLine}\nDELETE_THROUGH:${existingComment.endLine}\nOLD_COMMENT:\n${existingComment.text}\n---\n`
    : `LINE:${decl.getStartLineNumber()}\n`

  output += `DECLARATION:\n${declarationText}\n---\n`

  const eventKeys = collectOnEventKeys(info, sourceFile)
  if (eventKeys) {
    const eventValues = resolveEventValues(eventKeys)
    const eventLines = eventKeys.map(k => {
      const v = eventValues.get(k)
      return v ? `${k} ${v}` : k
    })
    output += `EVENTS:\n${eventLines.join('\n')}\n---\n`
  }

  output += `${skeleton}\n`
  return output
}
