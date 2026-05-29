/**
 * Generates a pre-filled TSDoc skeleton for an exported symbol.
 *
 * Reads the TypeScript source, finds the named export, and prints a comment
 * block with @typeParam / @param / @returns stubs pre-populated from the
 * signature — exactly what VSCode's "Add JSDoc Comment" action inserts, but
 * runnable from the CLI so the write-tsdoc skill can call it before filling
 * in prose.
 *
 * Usage:
 *   npx tsx build/tsdoc-stub.ts --file <path> --symbol <name>
 */

import { Project, Node } from 'ts-morph'
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

function buildSkeleton({ typeParams, params, hasReturn }: SymbolInfo, releaseTag: string): string {
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

  return ['/**', ' *', ...tagLines, ' */'].join('\n')
}

const info = extractInfo(decl)
const releaseTag = resolveReleaseTag(symbolName, defaultRelease as ReleaseTag)
const line = decl.getStartLineNumber()
process.stdout.write(`LINE:${line}\n` + buildSkeleton(info, releaseTag) + '\n')
