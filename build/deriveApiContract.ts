import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
  mkdtempSync,
  rmSync,
} from 'fs'
import { join, dirname, resolve, relative } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { tmpdir } from 'os'
import { spawnSync } from 'child_process'
import { build as esbuild } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'src')
const DIST_DIR = join(ROOT, 'dist')
const DIST_COMPONENTS_DIR = join(DIST_DIR, 'components')
const DIST_CONTEXTS_DIR = join(DIST_DIR, 'contexts')
const OUTPUT_PATH = join(ROOT, 'docs/reference/api-contract.yaml')

const isVerifyMode = process.argv.includes('--verify')

enum OutputType {
  ComponentBlock = 'Component.Block',
  ComponentFlow = 'Component.Flow',
  ComponentHookField = 'Component.HookField',
  ComponentNamespace = 'Component.Namespace',
  ComponentProvider = 'Component.Provider',
  Constant = 'Constant',
  Error = 'Error',
  Function = 'Function',
  FunctionHook = 'Function.Hook',
  Unknown = 'Unknown',
}

// --- Build a Node-targeted bundle of src/index.ts and import it ---
// esbuild handles CJS/ESM interop (fixes robot3 named-export issues) and @/ path aliases.
// The result is the authoritative runtime export surface — names, values, and object shapes.

// Stubs out assets and Vite-specific features that don't run in Node.
const stubAssetsPlugin = {
  name: 'stub-assets',
  setup(build: import('esbuild').PluginBuild) {
    // Styles, images, SVGs (including ?react query variants from vite-plugin-svgr)
    build.onResolve({ filter: /\.(scss|css|png|jpg|jpeg|gif|webp|svg)/ }, args => ({
      path: args.path,
      namespace: 'stub',
    }))
    build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({
      contents: /\.svg/.test(args.path) ? 'export default function() { return null }' : '',
      loader: 'js',
    }))

    // import.meta.glob is Vite-only — replace it with a no-op in the one file that uses it
    build.onLoad({ filter: /I18n\.ts$/ }, args => {
      const source = readFileSync(args.path, 'utf-8')
      // esbuild's TS support strips the generic, leaving a valid call to the stub
      const patched =
        'const __viteGlob__ = (..._args: unknown[]) => ({});\n' +
        source.replace(/import\.meta\.glob/g, '__viteGlob__')
      return { contents: patched, loader: 'ts' }
    })
  },
}

async function importSDKExports(): Promise<Record<string, unknown>> {
  const tmpDir = mkdtempSync(join(tmpdir(), 'sdk-node-'))
  const outfile = join(tmpDir, 'index.mjs')
  try {
    await esbuild({
      entryPoints: [join(SRC_DIR, 'index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      tsconfig: join(ROOT, 'tsconfig.json'),
      plugins: [stubAssetsPlugin],
      logLevel: 'silent',
    })
    return (await import(pathToFileURL(outfile).href)) as Record<string, unknown>
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

const SDK_EXPORTS = await importSDKExports()

// --- Type detection ---

// Manual overrides: maps export name to its exact type string.
const OVERRIDES: Record<string, OutputType> = {
  GustoProviderCustomUIAdapter: OutputType.ComponentProvider,
}

// Derives the export type from the runtime value and name conventions.
// Object-valued exports reveal their structure directly; function-valued exports
// are classified by naming convention (hooks, utilities, providers, etc.).
function detectType(name: string, val: unknown): OutputType {
  if (OVERRIDES[name]) return OVERRIDES[name]

  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) return OutputType.Constant
    // A namespace is an object where every value is a function (React component)
    const values = Object.values(val as Record<string, unknown>)
    if (values.length > 0 && values.every(v => typeof v === 'function'))
      return OutputType.ComponentNamespace
    return OutputType.Constant
  }

  if (typeof val !== 'function') return OutputType.Constant

  // Function-valued exports: classified by name convention
  if (name.endsWith('Provider')) return OutputType.ComponentProvider
  if (name.endsWith('HookField')) return OutputType.ComponentHookField
  if (name.startsWith('use')) return OutputType.FunctionHook
  if (/^[A-Z]/.test(name) && name.endsWith('Error')) return OutputType.Error
  if (/^[a-z]/.test(name)) return OutputType.Function
  return OutputType.Unknown
}

// Returns sorted child keys for object-shaped exports (namespaces, constants with sub-keys).
function getChildren(val: unknown): string[] | null {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return null
  const keys = Object.keys(val as object)
  if (keys.length === 0) return null
  return keys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

// --- JSDoc lookup (file parsing, used only for comments) ---

function resolveImportPath(fromDir: string, importPath: string): string {
  const rawPath = importPath.startsWith('@/')
    ? join(SRC_DIR, importPath.slice(2))
    : resolve(fromDir, importPath)

  for (const suffix of ['', '.d.ts', '.ts', '.tsx', '/index.d.ts', '/index.ts', '/index.tsx']) {
    const candidate = rawPath + suffix
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
    } catch {
      // ignore
    }
  }
  return rawPath + '.ts'
}

function extractJsDocText(raw: string): string {
  return raw
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

interface JsDocPosition {
  start: number
  end: number
  text: string
}

function findJsDocPositions(content: string): JsDocPosition[] {
  const positions: JsDocPosition[] = []
  const pattern = /\/\*\*([\s\S]*?)\*\//g
  for (const match of content.matchAll(pattern)) {
    positions.push({
      start: match.index!,
      end: match.index! + match[0].length,
      text: extractJsDocText(match[1]),
    })
  }
  return positions
}

function findPrecedingJsDoc(
  content: string,
  positions: JsDocPosition[],
  pos: number,
): string | null {
  let best: JsDocPosition | null = null
  for (const jd of positions) {
    if (jd.end <= pos && /^[\s]*$/.test(content.slice(jd.end, pos))) {
      if (!best || jd.end > best.end) best = jd
    }
  }
  return best?.text || null
}

interface ParsedExport {
  names: string[]
  fromPath: string | null
  jsDoc: string | null
  isNamespace: boolean
}

function parseExportNames(raw: string): string[] {
  return raw
    .split(',')
    .map(part => {
      const trimmed = part.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('type ')) return ''
      const asMatch = trimmed.match(/^\w+\s+as\s+(\w+)$/)
      return asMatch ? asMatch[1] : trimmed
    })
    .filter(Boolean)
}

function parseExports(filePath: string): ParsedExport[] {
  let content: string
  try {
    content = readFileSync(filePath, 'utf-8')
  } catch {
    return []
  }
  const jsDocPositions = findJsDocPositions(content)
  const results: ParsedExport[] = []

  const namespacePattern = /export\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g
  for (const match of content.matchAll(namespacePattern)) {
    results.push({
      names: [match[1]],
      fromPath: match[2],
      jsDoc: findPrecedingJsDoc(content, jsDocPositions, match.index!),
      isNamespace: true,
    })
  }

  const namedPattern = /export\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
  for (const match of content.matchAll(namedPattern)) {
    if (match[1]) continue
    results.push({
      names: parseExportNames(match[2]),
      fromPath: match[3],
      jsDoc: findPrecedingJsDoc(content, jsDocPositions, match.index!),
      isNamespace: false,
    })
  }

  return results
}

// Follows one level of import to find a JSDoc on the declaration or re-export.
function lookupJsDoc(barrelDir: string, fromPath: string, name: string): string | null {
  const sourceFile = resolveImportPath(barrelDir, fromPath)
  if (!existsSync(sourceFile)) return null

  let content: string
  try {
    content = readFileSync(sourceFile, 'utf-8')
  } catch {
    return null
  }

  const jsDocPositions = findJsDocPositions(content)

  const namedPattern = /export\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
  for (const match of content.matchAll(namedPattern)) {
    if (match[1]) continue
    if (parseExportNames(match[2]).includes(name)) {
      const jsDoc = findPrecedingJsDoc(content, jsDocPositions, match.index!)
      if (jsDoc) return jsDoc
    }
  }

  const wildcardPattern = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g
  for (const match of content.matchAll(wildcardPattern)) {
    const jsDoc = findPrecedingJsDoc(content, jsDocPositions, match.index!)
    if (jsDoc) return jsDoc
  }

  // Handles both .ts declarations and .d.ts `export declare` forms
  const declPattern = /export\s+(?:declare\s+)?(?:const|function|class|enum)\s+(\w+)/g
  for (const match of content.matchAll(declPattern)) {
    if (match[1] === name) {
      const jsDoc = findPrecedingJsDoc(content, jsDocPositions, match.index!)
      if (jsDoc) return jsDoc
    }
  }

  return null
}

// Scans dist .d.ts barrel files to build a fromPath map for JSDoc lookup.
interface ExportMeta {
  fromPath: string | null
  barrelDir: string
  jsDoc: string | null
}

function buildMetaMap(): Map<string, ExportMeta> {
  const map = new Map<string, ExportMeta>()
  const scan = (filePath: string, barrelDir: string) => {
    for (const group of parseExports(filePath)) {
      for (const name of group.names) {
        if (!map.has(name)) {
          map.set(name, { fromPath: group.fromPath, barrelDir, jsDoc: group.jsDoc })
        }
      }
    }
  }
  scan(join(DIST_COMPONENTS_DIR, 'index.d.ts'), DIST_COMPONENTS_DIR)
  scan(join(DIST_CONTEXTS_DIR, 'index.d.ts'), DIST_CONTEXTS_DIR)
  scan(join(DIST_DIR, 'index.d.ts'), DIST_DIR)
  return map
}

// --- Entry shape ---

interface ApiEntry {
  type: OutputType
  comment?: string
  children?: string[]
}

// --- Main derivation ---

function deriveApiContract(): Record<string, ApiEntry> {
  const metaMap = buildMetaMap()
  const result: Record<string, ApiEntry> = {}

  for (const name of Object.keys(SDK_EXPORTS)) {
    const val = SDK_EXPORTS[name]
    const type = detectType(name, val)

    const meta = metaMap.get(name) ?? { fromPath: null, barrelDir: DIST_DIR, jsDoc: null }
    let comment = meta.jsDoc
    if (!comment && meta.fromPath) {
      comment = lookupJsDoc(meta.barrelDir, meta.fromPath, name)
    }

    const children = getChildren(val)

    const entry: ApiEntry = { type }
    if (comment) entry.comment = comment
    if (children) entry.children = children
    result[name] = entry
  }

  // Sort alphabetically, case-sensitive (UPPER_CASE → PascalCase → camelCase)
  const sorted: Record<string, ApiEntry> = {}
  for (const key of Object.keys(result).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
    sorted[key] = result[key]
  }
  return sorted
}

// --- YAML serialization ---
// Hand-rolled for this specific structure — no library needed.
// Single-line comment strings are double-quoted (handles leading @ and backticks).
// Multi-line comment strings use a block scalar (|) for readability.

function yamlDoubleQuote(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function yamlCommentScalar(comment: string, indent: string): string {
  if (!comment.includes('\n')) return yamlDoubleQuote(comment)
  // Block scalar: each line indented two spaces beyond the key's indent
  const block = comment
    .split('\n')
    .map(l => `${indent}  ${l}`)
    .join('\n')
  return `|\n${block}`
}

function toYaml(contract: { exports: Record<string, ApiEntry> }): string {
  const lines: string[] = [
    '# This file is auto-generated by build/deriveApiContract.ts.',
    '# Do not edit manually — run "npm run api-contract:derive" to regenerate.',
    '',
    'exports:',
  ]
  for (const [name, entry] of Object.entries(contract.exports)) {
    lines.push(`  ${name}:`)
    lines.push(`    type: ${entry.type}`)
    if (entry.comment) {
      lines.push(`    comment: ${yamlCommentScalar(entry.comment, '    ')}`)
    }
    if (entry.children && entry.children.length > 0) {
      lines.push(`    children:`)
      for (const child of entry.children) {
        lines.push(`      - ${child}`)
      }
    }
  }
  return lines.join('\n') + '\n'
}

// --- Generate mode ---

function generate() {
  const exports = deriveApiContract()
  const yaml = toYaml({ exports })
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, yaml, 'utf-8')
  console.log(`API contract written: ${Object.keys(exports).length} exports`)
  console.log(`  YAML -> ${OUTPUT_PATH}`)
}

// --- Diff helper ---

function printDiff(committedPath: string, freshContent: string): void {
  const tmpPath = committedPath + '.tmp'
  try {
    writeFileSync(tmpPath, freshContent, 'utf-8')
    const rel = relative(ROOT, committedPath)
    const result = spawnSync(
      'diff',
      ['-u', '--label', `a/${rel}`, '--label', `b/${rel}`, committedPath, tmpPath],
      { encoding: 'utf-8' },
    )
    if (result.stdout) process.stderr.write(result.stdout)
  } finally {
    rmSync(tmpPath, { force: true })
  }
}

// --- Verify mode ---

function verify() {
  if (!existsSync(OUTPUT_PATH)) {
    console.error(`ERROR: ${OUTPUT_PATH} does not exist.`)
    console.error('Run "npm run api-contract:derive" to generate it.')
    process.exit(1)
  }

  const exports = deriveApiContract()
  const freshYaml = toYaml({ exports })
  const committedYaml = readFileSync(OUTPUT_PATH, 'utf-8')

  if (committedYaml === freshYaml) {
    console.log('API contract is up to date.')
    process.exit(0)
  }

  console.error('ERROR: API contract is out of date.')
  printDiff(OUTPUT_PATH, freshYaml)
  console.error('Fix: run "npm run api-contract:derive" and commit the updated file.')
  process.exit(1)
}

// --- Entry point ---

if (isVerifyMode) {
  verify()
} else {
  generate()
}
