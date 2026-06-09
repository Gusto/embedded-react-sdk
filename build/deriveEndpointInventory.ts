import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  statSync,
  existsSync,
  rmSync,
} from 'fs'
import { join, dirname, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { Project, SourceFile, SyntaxKind } from 'ts-morph'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'src')
const FUNCS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api-v-2025-11-15/src/funcs')
const OPS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api-v-2025-11-15/src/models/operations')
const COMPONENTS_DIR = join(ROOT, 'src/components')
const JSON_OUTPUT_PATH = join(ROOT, 'docs/reference/endpoint-inventory.json')
const MD_OUTPUT_PATH = join(ROOT, 'docs/reference/endpoint-reference.md')

const isVerifyMode = process.argv.includes('--verify')

interface Endpoint {
  method: string
  path: string
}

interface BlockEntry {
  endpoints: Endpoint[]
  variables: string[]
}

interface FlowEntry {
  blocks: string[]
}

interface BlockMapping {
  blockName: string
  componentDir: string
  /** true if the namespace itself is annotated as deprecated in index.ts */
  namespaceDeprecated: boolean
  /** true if the specific export within the barrel file is annotated as deprecated */
  exportDeprecated: boolean
}

interface FlowMapping {
  flowName: string
  flowDir: string
}

interface Inventory {
  blocks: Record<string, BlockEntry>
  flows: Record<string, FlowEntry>
}

interface DerivationResult {
  inventory: Inventory
  funcLookup: Map<string, Endpoint>
}

function createApiProject(): Project {
  return new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })
}

function snakeToCamel(snake: string): string {
  return snake.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())
}

function buildSnakeToCamelLookup(project: Project): Map<string, string> {
  const opFiles = project.addSourceFilesAtPaths(join(OPS_DIR, '*.ts'))
  const lookup = new Map<string, string>()

  for (const file of opFiles) {
    file.forEachDescendant(node => {
      if (node.getKind() !== SyntaxKind.CallExpression) return
      const call = node.asKindOrThrow(SyntaxKind.CallExpression)
      if (call.getExpression().getText() !== 'remap$') return

      const mapArg = call.getArguments()[1]
      if (mapArg?.getKind() !== SyntaxKind.ObjectLiteralExpression) return

      const obj = mapArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
      for (const prop of obj.getProperties()) {
        if (prop.getKind() !== SyntaxKind.PropertyAssignment) continue
        const pa = prop.asKindOrThrow(SyntaxKind.PropertyAssignment)
        const camelName = pa.getName()
        const init = pa.getInitializer()
        if (init?.getKind() !== SyntaxKind.StringLiteral) continue
        const snakeName = init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()

        if (/^[a-z]/.test(camelName) && /^[a-z_]+$/.test(snakeName)) {
          lookup.set(snakeName, camelName)
        }
      }
    })
  }

  return lookup
}

function buildParamNameMap(project: Project, funcPaths: string[]): Record<string, string> {
  const snakeToCamelLookup = buildSnakeToCamelLookup(project)
  const paramNameMap: Record<string, string> = {}

  for (const path of funcPaths) {
    // {employee_id}  →  snakeParam = "employee_id"
    for (const [_fullMatch, snakeParam] of path.matchAll(/\{([^}]+)\}/g)) {
      if (!paramNameMap[snakeParam]) {
        paramNameMap[snakeParam] = snakeToCamelLookup.get(snakeParam) ?? snakeToCamel(snakeParam)
      }
    }
  }

  return paramNameMap
}

function collectRawFuncPaths(
  project: Project,
): { funcName: string; path: string; method: string }[] {
  const funcFiles = project.addSourceFilesAtPaths(join(FUNCS_DIR, '*.ts'))
  const results: { funcName: string; path: string; method: string }[] = []

  for (const file of funcFiles) {
    const funcName = file.getBaseNameWithoutExtension()
    let path = ''
    let method = ''

    file.forEachDescendant(node => {
      if (node.getKind() === SyntaxKind.CallExpression) {
        const call = node.asKindOrThrow(SyntaxKind.CallExpression)
        if (call.getExpression().getText() === 'pathToFunc') {
          const arg = call.getArguments()[0]
          if (arg?.getKind() === SyntaxKind.StringLiteral) {
            path = arg.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
          }
        }
      }
      if (node.getKind() === SyntaxKind.PropertyAssignment) {
        const pa = node.asKindOrThrow(SyntaxKind.PropertyAssignment)
        if (pa.getName() === 'method') {
          const init = pa.getInitializer()
          if (init?.getKind() === SyntaxKind.StringLiteral) {
            method = init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
          }
        }
      }
    })

    if (path && method) {
      results.push({ funcName, path, method })
    }
  }

  return results
}

function buildFuncLookup(project: Project): Map<string, Endpoint> {
  const rawFuncs = collectRawFuncPaths(project)
  const paramNameMap = buildParamNameMap(
    project,
    rawFuncs.map(f => f.path),
  )

  const lookup = new Map<string, Endpoint>()
  for (const { funcName, path, method } of rawFuncs) {
    lookup.set(funcName, {
      method,
      path: normalizeEndpointPath(path, paramNameMap),
    })
  }

  return lookup
}

function walkDir(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath))
    } else if (
      /\.(ts|tsx)$/.test(entry) &&
      !entry.includes('.test.') &&
      !entry.includes('.stories.')
    ) {
      results.push(fullPath)
    }
  }
  return results
}

function collectTransitiveApiImports(
  project: Project,
  entryFilePaths: string[],
  componentDir: string,
  otherBlockDirs: Set<string>,
): Set<string> {
  const visited = new Set<string>()
  const funcNames = new Set<string>()

  function followSpec(spec: string, getResolved: () => SourceFile | undefined) {
    if (spec.startsWith('@gusto/embedded-api-v-2025-11-15/react-query/')) {
      const name = spec.slice('@gusto/embedded-api-v-2025-11-15/react-query/'.length)
      if (!name.startsWith('_')) funcNames.add(name)
    } else if (spec.startsWith('@gusto/embedded-api-v-2025-11-15/funcs/')) {
      funcNames.add(spec.slice('@gusto/embedded-api-v-2025-11-15/funcs/'.length))
    } else if (spec.startsWith('.') || spec.startsWith('@/hooks/')) {
      // Follow relative imports (catches ../shared/ hooks) and cross-cutting utility hooks.
      // Deliberately skip @/components/, @/contexts/, @/helpers/ etc. to avoid
      // cascading through UI primitives and cross-domain components.
      // Also stop at other blocks' directories so flow orchestrators don't absorb
      // their sub-blocks' endpoints (those are already inventoried separately).
      const resolved = getResolved()
      if (!resolved) return
      const targetPath = resolved.getFilePath()
      if (!targetPath.startsWith(SRC_DIR + '/')) return
      const isOtherBlock = [...otherBlockDirs].some(
        dir => dir !== componentDir && targetPath.startsWith(dir + '/'),
      )
      if (!isOtherBlock) visitFile(targetPath)
    }
  }

  function visitFile(filePath: string) {
    if (visited.has(filePath)) return
    visited.add(filePath)

    const sourceFile = project.addSourceFileAtPathIfExists(filePath)
    if (!sourceFile) return

    for (const decl of sourceFile.getImportDeclarations()) {
      if (decl.isTypeOnly()) continue
      followSpec(decl.getModuleSpecifierValue(), () => decl.getModuleSpecifierSourceFile())
    }
    for (const decl of sourceFile.getExportDeclarations()) {
      if (decl.isTypeOnly()) continue
      const spec = decl.getModuleSpecifierValue()
      if (spec) {
        followSpec(spec, () => decl.getModuleSpecifierSourceFile())
      }
    }
  }

  for (const filePath of entryFilePaths) {
    visitFile(filePath)
  }

  return funcNames
}

function normalizeEndpointPath(openApiPath: string, paramNameMap: Record<string, string>): string {
  // {employee_id}  →  paramName = "employee_id"
  return openApiPath.replace(/\{([^}]+)\}/g, (_match, paramName: string) => {
    const normalized = paramNameMap[paramName]
    if (!normalized) {
      console.warn(`  Warning: Unknown param {${paramName}} in ${openApiPath}`)
      return `:${paramName}`
    }
    return `:${normalized}`
  })
}

type NamespaceInfo =
  | { domainDir: string; deprecated: true; deprecationMessage: string }
  | { domainDir: string; deprecated: false }

function parseNamespaceExports(): Map<string, NamespaceInfo> {
  const indexPath = join(COMPONENTS_DIR, 'index.ts')
  const namespaces = new Map<string, NamespaceInfo>()

  try {
    const content = readFileSync(indexPath, 'utf-8')
    // export * as EmployeeManagement from './Employee/exports/employeeManagement'  →
    //   namespaceName = "EmployeeManagement"
    //   domainDir = "Employee/exports/employeeManagement"
    // Captures the optional /** @deprecated ... */ JSDoc comment that may precede the export.
    const namespacePattern =
      /(\/\*\*[\s\S]*?@deprecated[\s\S]*?\*\/\s*)?export\s+\*\s+as\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"]/g
    for (const [_fullMatch, jsdoc, namespaceName, domainDir] of content.matchAll(
      namespacePattern,
    )) {
      if (jsdoc) {
        // Extract the text that follows "@deprecated" inside the JSDoc block.
        const match = /@deprecated\s+([\s\S]*?)\s*\*\//.exec(jsdoc)
        const deprecationMessage = match ? match[1].replace(/\s*\*\s*/g, ' ').trim() : ''
        namespaces.set(namespaceName, { domainDir, deprecated: true, deprecationMessage })
      } else {
        namespaces.set(namespaceName, { domainDir, deprecated: false })
      }
    }
  } catch (err) {
    console.error(`ERROR: Could not read ${indexPath}`)
    throw err
  }

  return namespaces
}

interface ComponentExport {
  importPath: string
  deprecated: boolean
}

function parseComponentExports(domainDir: string): Map<string, ComponentExport> {
  const exports = new Map<string, ComponentExport>()
  const possibleBarrelFiles = [
    join(domainDir, 'index.ts'),
    join(domainDir, 'index.tsx'),
    domainDir + '.ts',
    domainDir + '.tsx',
  ]

  for (const barrelPath of possibleBarrelFiles) {
    try {
      const content = readFileSync(barrelPath, 'utf-8')
      // Optionally captures a /** @deprecated */ JSDoc comment that may precede the export.
      // export { EmployeeDocuments as Documents } from './Documents'  →
      //   nameToken = "EmployeeDocuments as Documents"
      //   importPath = "./Documents"
      // Uses the alias when present so the map key matches the public export name.
      const exportPattern =
        /(\/\*\*[\s\S]*?@deprecated[\s\S]*?\*\/\s*)?export\s+\{\s*(\w+(?:\s+as\s+\w+)?)[^}]*?\}\s+from\s+['"](\.[^'"]+)['"]/g
      for (const [_fullMatch, jsdoc, nameToken, importPath] of content.matchAll(exportPattern)) {
        const asIndex = nameToken.indexOf(' as ')
        const componentName = asIndex >= 0 ? nameToken.slice(asIndex + 4).trim() : nameToken.trim()
        exports.set(componentName, { importPath, deprecated: !!jsdoc })
      }
      break
    } catch {
      // barrel file doesn't exist, try next
    }
  }

  return exports
}

function resolveComponentDirectory(domainDir: string, importPath: string): string {
  const effectiveBase =
    existsSync(domainDir) && statSync(domainDir).isDirectory() ? domainDir : dirname(domainDir)
  const resolved = resolve(effectiveBase, importPath)

  if (existsSync(resolved + '.tsx') || existsSync(resolved + '.ts')) {
    return dirname(resolved)
  }

  if (existsSync(resolved) && statSync(resolved).isDirectory()) {
    return resolved
  }

  return resolved
}

function discoverBlocks(): {
  blocks: BlockMapping[]
  /** Maps namespace name to its deprecation message (empty string if no message). */
  deprecatedNamespaces: Map<string, string>
} {
  const blocks: BlockMapping[] = []
  const namespaces = parseNamespaceExports()
  const deprecatedNamespaces = new Map<string, string>()

  for (const [namespaceName, namespaceInfo] of namespaces.entries()) {
    if (namespaceInfo.deprecated)
      deprecatedNamespaces.set(namespaceName, namespaceInfo.deprecationMessage)
    const { domainDir: domainDirName, deprecated: nsDeprecated } = namespaceInfo
    const domainDir = join(COMPONENTS_DIR, domainDirName)
    const componentExports = parseComponentExports(domainDir)

    for (const [
      componentName,
      { importPath, deprecated: exportDeprecated },
    ] of componentExports.entries()) {
      const componentDir = resolveComponentDirectory(domainDir, importPath)
      blocks.push({
        blockName: `${namespaceName}.${componentName}`,
        componentDir,
        namespaceDeprecated: nsDeprecated,
        exportDeprecated,
      })
    }
  }

  return { blocks, deprecatedNamespaces }
}

function discoverFlows(): FlowMapping[] {
  const flows: FlowMapping[] = []
  const namespaces = parseNamespaceExports()

  for (const [namespaceName, { domainDir: domainDirName }] of namespaces.entries()) {
    const domainDir = join(COMPONENTS_DIR, domainDirName)
    const componentExports = parseComponentExports(domainDir)

    for (const [componentName, { importPath }] of componentExports.entries()) {
      if (!componentName.endsWith('Flow')) continue
      const flowDir = resolveComponentDirectory(domainDir, importPath)
      flows.push({ flowName: `${namespaceName}.${componentName}`, flowDir })
    }
  }

  return flows
}

function deriveBlocksFromImport(
  resolvedImportPath: string,
  rawImportedNames: string,
  dirToBlocks: Map<string, string[]>,
  preferredNamespace?: string,
  blockDeprecationLevel?: Map<string, number>,
): string[] {
  // Find the most specific directory that matches this import path
  let matchingDir: string | undefined
  for (const dir of dirToBlocks.keys()) {
    if (resolvedImportPath === dir || resolvedImportPath.startsWith(dir + '/')) {
      if (!matchingDir || dir.length > matchingDir.length) {
        matchingDir = dir
      }
    }
  }

  if (!matchingDir) return []

  const blocks = dirToBlocks.get(matchingDir)!
  if (blocks.length === 1) return blocks

  const importedNames = rawImportedNames.split(',').map((name: string) =>
    name
      .trim()
      // Look at the export name only, ignore any `x as y`
      .split(/\s+as\s+/)[0]
      .trim(),
  )

  const nameMatchedBlocks = new Set<string>()
  for (const blockName of blocks) {
    const componentName = blockName.split('.').pop()
    if (componentName && importedNames.includes(componentName)) {
      nameMatchedBlocks.add(blockName)
    }
  }

  // When imports use contextual wrappers (e.g. CompensationContextual) that don't
  // match the block's component name, name matching returns nothing. Fall back to
  // all blocks for this dir so the namespace-preference step below can still filter.
  const candidates = nameMatchedBlocks.size > 0 ? [...nameMatchedBlocks] : blocks

  if (candidates.length <= 1) return candidates

  // Prefer blocks from the flow's own namespace first.
  if (preferredNamespace) {
    const sameNamespaceBlocks = candidates.filter(b => b.startsWith(preferredNamespace + '.'))
    if (sameNamespaceBlocks.length > 0) return sameNamespaceBlocks
  }

  // No same-namespace match. Prefer least-deprecated blocks using a tiered approach:
  //   level 0 = fully active
  //   level 1 = namespace deprecated (whole namespace is being phased out)
  //   level 2 = export deprecated (explicit "don't use this" on the specific export)
  // Export-deprecated loses to namespace-deprecated because a targeted export @deprecated
  // is a stronger signal to avoid that specific block than a namespace-wide deprecation.
  if (blockDeprecationLevel) {
    const minLevel = Math.min(...candidates.map(b => blockDeprecationLevel.get(b) ?? 0))
    const leastDeprecated = candidates.filter(b => (blockDeprecationLevel.get(b) ?? 0) === minLevel)
    if (leastDeprecated.length < candidates.length) return leastDeprecated
  }

  return candidates
}

function deriveFlowBlocks(
  flowDir: string,
  blockMappings: BlockMapping[],
  flowNamespace: string,
): string[] {
  const files = walkDir(flowDir)
  const blockNames = new Set<string>()

  const dirToBlocks = new Map<string, string[]>()
  // Deprecation level: 0 = active, 1 = namespace deprecated, 2 = export deprecated.
  // Export-deprecated is ranked worst because it's an explicit "don't use this" on
  // a specific export (vs. a whole namespace being phased out).
  const blockDeprecationLevel = new Map<string, number>()
  for (const mapping of blockMappings) {
    if (!dirToBlocks.has(mapping.componentDir)) {
      dirToBlocks.set(mapping.componentDir, [])
    }
    dirToBlocks.get(mapping.componentDir)!.push(mapping.blockName)
    const level = mapping.exportDeprecated ? 2 : mapping.namespaceDeprecated ? 1 : 0
    blockDeprecationLevel.set(mapping.blockName, level)
  }

  // import { EmployeeForm } from '@/components/Employee/Form'  →
  //   allImportedNames = " EmployeeForm "
  //   importPath = "Employee/Form"
  const absoluteImportPattern = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/([^'"]+)['"]/g
  // import { EmployeeForm, AnotherImport } from '../shared/EmployeeForm'  →
  //   allImportedNames = " EmployeeForm, AnotherImport "
  //   importPath = "../shared/EmployeeForm"
  const relativeImportPattern = /import\s+\{([^}]+)\}\s+from\s+['"](\.[^'"]+)['"]/g

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8')

    for (const match of content.matchAll(absoluteImportPattern)) {
      const [_fullMatch, allImportedNames, importPath] = match
      if (
        importPath.startsWith('Flow/') ||
        importPath.startsWith('Base') ||
        importPath.startsWith('Common/')
      ) {
        continue
      }

      deriveBlocksFromImport(
        join(COMPONENTS_DIR, importPath),
        allImportedNames,
        dirToBlocks,
        flowNamespace,
        blockDeprecationLevel,
      ).forEach(blockName => blockNames.add(blockName))
    }

    for (const match of content.matchAll(relativeImportPattern)) {
      const [_fullMatch, allImportedNames, importPath] = match
      if (importPath.includes('/Flow/') || importPath.includes('useFlow')) {
        continue
      }

      deriveBlocksFromImport(
        resolve(dirname(filePath), importPath),
        allImportedNames,
        dirToBlocks,
        flowNamespace,
        blockDeprecationLevel,
      ).forEach(blockName => blockNames.add(blockName))
    }
  }

  return [...blockNames].sort()
}

function extractVariables(endpoints: Endpoint[]): string[] {
  const variables = new Set<string>()
  for (const ep of endpoints) {
    // :companyId  →  varName = "companyId"
    for (const [_fullMatch, varName] of ep.path.matchAll(/:([a-zA-Z]+)/g)) {
      variables.add(varName)
    }
  }
  return [...variables].sort()
}

const METHOD_RANK: Record<string, number> = { GET: 0, POST: 1, PUT: 2, PATCH: 3, DELETE: 4 }

function deduplicateEndpoints(endpoints: Endpoint[]): Endpoint[] {
  const seen = new Set<string>()
  return endpoints
    .filter(ep => {
      const key = `${ep.method} ${ep.path}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => {
      const pathOrder = a.path.localeCompare(b.path)
      if (pathOrder !== 0) return pathOrder
      return (METHOD_RANK[a.method] ?? 99) - (METHOD_RANK[b.method] ?? 99)
    })
}

function deriveInventory(): DerivationResult {
  const project = createApiProject()
  const funcLookup = buildFuncLookup(project)
  const { blocks: blockMappings } = discoverBlocks()
  const allBlockDirs = new Set(blockMappings.map(m => m.componentDir))

  const blocks: Record<string, BlockEntry> = {}

  for (const { blockName, componentDir } of blockMappings) {
    const files = walkDir(componentDir)
    const funcNames = collectTransitiveApiImports(project, files, componentDir, allBlockDirs)

    const endpoints: Endpoint[] = []
    for (const funcName of funcNames) {
      const info = funcLookup.get(funcName)
      if (info) {
        endpoints.push({ method: info.method, path: info.path })
      }
    }

    if (endpoints.length > 0) {
      const deduped = deduplicateEndpoints(endpoints)
      blocks[blockName] = {
        endpoints: deduped,
        variables: extractVariables(deduped),
      }
    }
  }

  const flowMappings = discoverFlows()
  const flows: Record<string, FlowEntry> = {}

  for (const { flowName, flowDir } of flowMappings) {
    const flowNamespace = flowName.split('.')[0]!
    const blockNames = deriveFlowBlocks(flowDir, blockMappings, flowNamespace).filter(
      b => b !== flowName,
    )
    flows[flowName] = { blocks: blockNames }
  }

  const sortedFlows = Object.fromEntries(
    Object.entries(flows).sort(([a], [b]) => a.localeCompare(b)),
  )

  return { inventory: { blocks, flows: sortedFlows }, funcLookup }
}

function generateMarkdown(inventory: Inventory): string {
  const lines: string[] = [
    '---',
    "title: 'Endpoint Reference'",
    'description: Auto-generated list of every Gusto Embedded API endpoint each SDK block calls, with HTTP methods, paths, and URL parameters for proxy allowlisting.',
    '---',
    '',
    '<!-- AUTO-GENERATED FILE. Do not edit manually. Run "npm run endpoints:derive" to regenerate. -->',
    '',
    '# Endpoint Reference',
    '',
    'Every SDK component ("block") makes a specific set of API calls. This reference lists them all. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).',
    '',
    'Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime. This data is also available as a machine-readable JSON file at [`endpoint-inventory.json`](./endpoint-inventory.json), which includes the list of variables each block expects. For programmatic access, import it directly from the package:',
    '',
    '```typescript',
    "import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'",
    '```',
    '',
  ]

  const blocksByDomain = new Map<string, [string, BlockEntry][]>()

  for (const [name, entry] of Object.entries(inventory.blocks)) {
    const domain = name.includes('.') ? name.split('.')[0] : name
    if (!blocksByDomain.has(domain)) blocksByDomain.set(domain, [])
    blocksByDomain.get(domain)!.push([name, entry])
  }

  for (const [domain, domainBlocks] of blocksByDomain) {
    lines.push(`## ${domain} components`, '')
    lines.push('| Component | Method | Path |')
    lines.push('| --- | --- | --- |')

    for (const [blockName, entry] of domainBlocks) {
      let isFirst = true
      for (const ep of entry.endpoints) {
        const label = isFirst ? `**${blockName}**` : ''
        lines.push(`| ${label} | ${ep.method} | \`${ep.path}\` |`)
        isFirst = false
      }
    }

    lines.push('')
  }

  lines.push('## Flows', '')
  lines.push(
    'Flows compose multiple blocks into a single workflow. The endpoint list for a flow is the union of all its block endpoints.',
    '',
  )
  lines.push('| Flow | Blocks included |')
  lines.push('| --- | --- |')

  for (const [flowName, entry] of Object.entries(inventory.flows)) {
    lines.push(`| **${flowName}** | ${entry.blocks.join(', ')} |`)
  }

  lines.push('')

  return lines.join('\n')
}

function validateEndpoints(
  inventory: { blocks: Record<string, BlockEntry> },
  funcLookup: Map<string, Endpoint>,
) {
  const apiEndpoints = new Set<string>()
  for (const ep of funcLookup.values()) {
    apiEndpoints.add(`${ep.method} ${ep.path}`)
  }

  const invalid: string[] = []
  for (const [blockName, block] of Object.entries(inventory.blocks)) {
    for (const ep of block.endpoints) {
      const key = `${ep.method} ${ep.path}`
      if (!apiEndpoints.has(key)) {
        invalid.push(`${blockName}: ${key}`)
      }
    }
  }

  if (invalid.length > 0) {
    console.error(
      'WARNING: Some inventory endpoints were not found in @gusto/embedded-api-v-2025-11-15:',
    )
    for (const ep of invalid) console.error(`  ${ep}`)
    console.error('')
  }

  return invalid.length
}

function generate() {
  const { inventory, funcLookup } = deriveInventory()

  const invalidCount = validateEndpoints(inventory, funcLookup)

  mkdirSync(dirname(JSON_OUTPUT_PATH), { recursive: true })
  writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(inventory, null, 2) + '\n', 'utf-8')
  writeFileSync(MD_OUTPUT_PATH, generateMarkdown(inventory), 'utf-8')

  const blockCount = Object.keys(inventory.blocks).length
  const flowCount = Object.keys(inventory.flows).length
  console.log(`Endpoint inventory written: ${blockCount} blocks, ${flowCount} flows`)
  console.log(`  JSON -> ${relative(ROOT, JSON_OUTPUT_PATH)}`)
  console.log(`  Markdown -> ${relative(ROOT, MD_OUTPUT_PATH)}`)

  if (invalidCount > 0) {
    process.exit(1)
  }
}

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

function verify() {
  const filesToCheck = [JSON_OUTPUT_PATH, MD_OUTPUT_PATH]
  for (const filePath of filesToCheck) {
    if (!existsSync(filePath)) {
      console.error(`ERROR: ${relative(ROOT, filePath)} does not exist.`)
      console.error('Run "npm run endpoints:derive" to generate it.')
      process.exit(1)
    }
  }

  const { inventory: freshInventory, funcLookup } = deriveInventory()
  const invalidCount = validateEndpoints(freshInventory, funcLookup)
  const freshJson = JSON.stringify(freshInventory, null, 2) + '\n'
  const freshMd = generateMarkdown(freshInventory)

  const committedJson = readFileSync(JSON_OUTPUT_PATH, 'utf-8')
  const committedMd = readFileSync(MD_OUTPUT_PATH, 'utf-8')

  if (committedJson === freshJson && committedMd === freshMd && invalidCount === 0) {
    console.log('Endpoint inventory is up to date.')
    process.exit(0)
  }

  console.error('ERROR: Endpoint inventory is out of date.')
  console.error('')
  console.error('This can happen when:')
  console.error('  - A component added or removed an API hook/function import')
  console.error('  - A flow added or removed a block component')
  console.error('  - The @gusto/embedded-api-v-2025-11-15 package was updated')
  console.error('')
  if (committedJson !== freshJson) printDiff(JSON_OUTPUT_PATH, freshJson)
  if (committedMd !== freshMd) printDiff(MD_OUTPUT_PATH, freshMd)
  console.error('')
  console.error('Fix: run "npm run endpoints:derive" and commit the updated files.')
  process.exit(1)
}

if (isVerifyMode) {
  verify()
} else {
  generate()
}
