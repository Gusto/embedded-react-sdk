/**
 * CLI for generating TSDoc skeletons for exported symbols.
 *
 * Modes:
 *
 *   Single  --symbol NAME
 *     Outputs one block, or nothing + stderr if the symbol is already aligned.
 *     Exit 0 in both cases.
 *
 *   Batch   --symbols NAME1,NAME2,...  |  --all-exports
 *     Outputs one SYMBOL block per symbol:
 *       SYMBOL: NAME
 *       <block>         (same format as single mode)
 *     or:
 *       SYMBOL: NAME
 *       SKIP            (already aligned — nothing to write)
 *
 * Single-mode output (no existing comment):
 *   LINE:<n>
 *   DECLARATION:\n...\n---
 *   [EVENTS:\n...\n---]
 *   /** skeleton * /
 *
 * Single-mode output (existing comment without release tag):
 *   LINE:<n>
 *   DELETE_THROUGH:<m>
 *   OLD_COMMENT:\n...\n---
 *   DECLARATION:\n...\n---
 *   [EVENTS:\n...\n---]
 *   /** skeleton * /
 *
 * Usage:
 *   npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release alpha|beta|public|internal]
 *   npx tsx build/tsdoc-stub.ts --file <path> --symbols <n1,n2,...> [--default-release ...]
 *   npx tsx build/tsdoc-stub.ts --file <path> --all-exports [--default-release ...]
 */

import { Project } from 'ts-morph'
import { resolve } from 'path'
import { ROOT, VALID_RELEASE_TAGS, type ReleaseTag, processSymbol } from './tsdoc-stub-lib.js'

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 ? process.argv[idx + 1] : undefined
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

const filePath = getArg('--file')
const symbolArg = getArg('--symbol')
const symbolsArg = getArg('--symbols')
const allExports = hasFlag('--all-exports')
const defaultRelease = (getArg('--default-release') ?? 'alpha') as ReleaseTag

// ─── Validation ───────────────────────────────────────────────────────────────

if (!filePath) {
  process.stderr.write('Error: --file is required\n')
  process.exit(1)
}

const modeCount = [symbolArg, symbolsArg, allExports].filter(Boolean).length
if (modeCount === 0) {
  process.stderr.write(
    'Error: one of --symbol, --symbols, or --all-exports is required\n' +
      'Usage:\n' +
      '  npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release ...]\n' +
      '  npx tsx build/tsdoc-stub.ts --file <path> --symbols <n1,n2,...> [--default-release ...]\n' +
      '  npx tsx build/tsdoc-stub.ts --file <path> --all-exports [--default-release ...]\n',
  )
  process.exit(1)
}

if (modeCount > 1) {
  process.stderr.write('Error: --symbol, --symbols, and --all-exports are mutually exclusive\n')
  process.exit(1)
}

if (!VALID_RELEASE_TAGS.includes(defaultRelease)) {
  process.stderr.write(
    `Invalid --default-release "${defaultRelease}". Must be one of: ${VALID_RELEASE_TAGS.join(', ')}\n`,
  )
  process.exit(1)
}

// ─── Project setup ────────────────────────────────────────────────────────────

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

// ─── Single mode ──────────────────────────────────────────────────────────────

if (symbolArg) {
  try {
    const block = processSymbol(symbolArg, sourceFile, defaultRelease)
    if (block === null) {
      process.stderr.write(`Symbol '${symbolArg}' already has a TSDoc comment — skipping.\n`)
      process.exit(0)
    }
    process.stdout.write(block)
  } catch (err) {
    process.stderr.write(`${(err as Error).message}\n`)
    process.exit(1)
  }
  process.exit(0)
}

// ─── Batch mode ───────────────────────────────────────────────────────────────

let symbolNames: string[]

if (allExports) {
  // Only symbols whose first declaration lives in this file (skip re-exports)
  symbolNames = [...sourceFile.getExportedDeclarations().entries()]
    .filter(([, decls]) => decls[0]?.getSourceFile().getFilePath() === absPath)
    .map(([name]) => name)
} else {
  symbolNames = (symbolsArg ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (symbolNames.length === 0) {
    process.stderr.write('Error: --symbols requires a comma-separated list of symbol names\n')
    process.exit(1)
  }
}

for (const name of symbolNames) {
  try {
    const block = processSymbol(name, sourceFile, defaultRelease)
    if (block === null) {
      process.stdout.write(`SYMBOL: ${name}\nSKIP\n`)
    } else {
      process.stdout.write(`SYMBOL: ${name}\n${block}`)
    }
  } catch (err) {
    process.stderr.write(`Warning: ${(err as Error).message}\n`)
    // Continue to next symbol — don't abort the whole batch
  }
}
