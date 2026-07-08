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
import { DOMAINS } from '../docs-site/plugins/typedoc-custom/router.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'src')
const FUNCS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api/src/funcs')
const OPS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api/src/models/operations')
const COMPONENTS_DIR = join(ROOT, 'src/components')
const INDEX_PATH = join(SRC_DIR, 'index.ts')
const JSON_OUTPUT_PATH = join(ROOT, 'docs/guides/endpoint-inventory.json')
const MD_OUTPUT_PATH = join(ROOT, 'docs/guides/endpoint-reference.md')

// The dated API version the SDK targets. Kept in step with the
// @gusto/embedded-api-v-<version> package the rest of this file references.
const API_VERSION = '2026-02-01'
// Public API reference for the targeted version. Each endpoint links to its
// page here, e.g. PUT /v1/garnishments/:garnishmentId ->
// .../reference/put-v1-garnishments-garnishment_id
const DOCS_REFERENCE_BASE = `https://docs.gusto.com/embedded-payroll/v${API_VERSION}/reference`

const KNOWN_UNDOCUMENTED_OPERATIONS = new Set(['submit-information-request'])

const isVerifyMode = process.argv.includes('--verify')

interface Endpoint {
  method: string
  path: string
  /**
   * URL of the endpoint's page in the public API reference. Omitted for
   * endpoints in {@link KNOWN_UNDOCUMENTED_OPERATIONS}, which have no such page.
   */
  docsUrl?: string
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
  hooks: Record<string, BlockEntry>
}

interface HookMapping {
  hookName: string
  /** Component-tree domain the hook lives under, e.g. "Employee". */
  domain: string
  sourceFile: string
}

interface DerivationResult {
  inventory: Inventory
  funcLookup: Map<string, Endpoint>
  /** Maps each documented hook name to its component-tree domain, for markdown grouping. */
  hookDomains: Record<string, string>
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

/**
 * Builds the public API reference URL for an endpoint from its `operationID`,
 * which is the exact slug the reference uses for that endpoint's page (e.g.
 * `get-v1-company-forms`). The reference slug is not always derivable from the
 * method and path, so the `operationID` carried by the SDK is the source of truth.
 * Returns `undefined` for operations known to have no public reference page.
 */
function endpointDocsUrl(operationId: string): string | undefined {
  if (KNOWN_UNDOCUMENTED_OPERATIONS.has(operationId)) return undefined
  return `${DOCS_REFERENCE_BASE}/${operationId}`
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
): { funcName: string; path: string; method: string; operationId: string }[] {
  const funcFiles = project.addSourceFilesAtPaths(join(FUNCS_DIR, '*.ts'))
  const results: { funcName: string; path: string; method: string; operationId: string }[] = []

  for (const file of funcFiles) {
    const funcName = file.getBaseNameWithoutExtension()
    let path = ''
    let method = ''
    let operationId = ''

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
        const init = pa.getInitializer()
        if (init?.getKind() !== SyntaxKind.StringLiteral) return
        const value = init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
        if (pa.getName() === 'method') method = value
        // The operationID mirrors the endpoint's slug in the public API reference.
        if (pa.getName() === 'operationID') operationId = value
      }
    })

    if (path && method) {
      results.push({ funcName, path, method, operationId })
    }
  }

  return results
}

function warnIfStaleUndocumentedOperations(knownOperationIds: Set<string>): void {
  const stale = [...KNOWN_UNDOCUMENTED_OPERATIONS].filter(op => !knownOperationIds.has(op))
  if (stale.length === 0) return

  console.warn(
    'WARNING: KNOWN_UNDOCUMENTED_OPERATIONS lists operationIDs that no longer exist in ' +
      '@gusto/embedded-api-v-2026-02-01 (renamed or removed?):',
  )
  for (const op of stale) console.warn(`  ${op}`)
  console.warn('  Remove each stale entry, or update it to the current operationID.')
  console.warn('')
}

function buildFuncLookup(project: Project): Map<string, Endpoint> {
  const rawFuncs = collectRawFuncPaths(project)
  const paramNameMap = buildParamNameMap(
    project,
    rawFuncs.map(f => f.path),
  )

  warnIfStaleUndocumentedOperations(new Set(rawFuncs.map(f => f.operationId)))

  const lookup = new Map<string, Endpoint>()
  for (const { funcName, path, method, operationId } of rawFuncs) {
    lookup.set(funcName, {
      method,
      path: normalizeEndpointPath(path, paramNameMap),
      docsUrl: endpointDocsUrl(operationId),
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
    if (spec.startsWith('@gusto/embedded-api/react-query/')) {
      const name = spec.slice('@gusto/embedded-api/react-query/'.length)
      if (!name.startsWith('_')) funcNames.add(name)
    } else if (spec.startsWith('@gusto/embedded-api/funcs/')) {
      funcNames.add(spec.slice('@gusto/embedded-api/funcs/'.length))
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

function resolveAliasPath(moduleSpecifier: string): string | undefined {
  // '@/components/Employee/.../useX'  →  '<src>/components/Employee/.../useX'
  if (!moduleSpecifier.startsWith('@/')) return undefined
  const base = join(SRC_DIR, moduleSpecifier.slice(2))
  const candidates = [base + '.ts', base + '.tsx', join(base, 'index.ts'), join(base, 'index.tsx')]
  return candidates.find(candidate => existsSync(candidate))
}

// Domain grouping mirrors the reference-docs sidebar (DOMAINS in router.config.ts),
// so this file's sections line up with the Reference nav. Sidebar order is preserved.
const DOMAIN_ORDER: string[] = DOMAINS.map(domain => domain.label)

const NAMESPACE_TO_DOMAIN = new Map<string, string>()
const COMPONENT_DIR_TO_DOMAIN = new Map<string, string>()
for (const domain of DOMAINS) {
  // `path` doubles as the src/components subdir slug (e.g. 'employee', 'time-off').
  COMPONENT_DIR_TO_DOMAIN.set(domain.path.replace(/-/g, ''), domain.label)
  for (const namespace of domain.namespaces) {
    NAMESPACE_TO_DOMAIN.set(namespace.id, domain.label)
  }
}

/** Maps a `Namespace.Component` / `Namespace.Flow` key to its sidebar domain label. */
function namespaceToDomainLabel(name: string): string {
  const namespace = name.includes('.') ? name.split('.')[0]! : name
  return NAMESPACE_TO_DOMAIN.get(namespace) ?? namespace
}

function deriveHookDomain(moduleSpecifier: string): string {
  // '@/components/Employee/.../useCompensationForm'  →  component dir "Employee"  →  "Employees"
  const match = /@\/components\/([^/]+)\//.exec(moduleSpecifier)
  const componentDir = match ? match[1] : ''
  return COMPONENT_DIR_TO_DOMAIN.get(componentDir.toLowerCase()) ?? componentDir ?? 'Other'
}

function discoverHooks(project: Project): HookMapping[] {
  const indexFile = project.addSourceFileAtPath(INDEX_PATH)
  const hooks: HookMapping[] = []
  const seen = new Set<string>()

  for (const decl of indexFile.getExportDeclarations()) {
    if (decl.isTypeOnly()) continue
    const spec = decl.getModuleSpecifierValue()
    if (!spec) continue
    const sourceFile = resolveAliasPath(spec)
    if (!sourceFile) continue

    for (const named of decl.getNamedExports()) {
      if (named.isTypeOnly()) continue
      const hookName = named.getAliasNode()?.getText() ?? named.getName()
      if (!/^use[A-Z]/.test(hookName) || seen.has(hookName)) continue
      seen.add(hookName)
      hooks.push({ hookName, domain: deriveHookDomain(spec), sourceFile })
    }
  }

  return hooks
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
        endpoints.push({ method: info.method, path: info.path, docsUrl: info.docsUrl })
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

  const hookMappings = discoverHooks(project)
  const hooks: Record<string, BlockEntry> = {}
  const hookDomains: Record<string, string> = {}

  for (const { hookName, domain, sourceFile } of hookMappings) {
    // Empty otherBlockDirs: a hook is a leaf, so follow every transitive API import
    // it touches rather than stopping at block boundaries the way flows do.
    const funcNames = collectTransitiveApiImports(
      project,
      [sourceFile],
      dirname(sourceFile),
      new Set(),
    )

    const endpoints: Endpoint[] = []
    for (const funcName of funcNames) {
      const info = funcLookup.get(funcName)
      if (info) {
        endpoints.push({ method: info.method, path: info.path, docsUrl: info.docsUrl })
      }
    }

    if (endpoints.length > 0) {
      const deduped = deduplicateEndpoints(endpoints)
      hooks[hookName] = {
        endpoints: deduped,
        variables: extractVariables(deduped),
      }
      hookDomains[hookName] = domain
    }
  }

  const sortedHooks = Object.fromEntries(
    Object.entries(hooks).sort(([a], [b]) => a.localeCompare(b)),
  )

  return { inventory: { blocks, flows: sortedFlows, hooks: sortedHooks }, funcLookup, hookDomains }
}

function generateMarkdown(inventory: Inventory, hookDomains: Record<string, string>): string {
  const lines: string[] = [
    '---',
    "title: 'Endpoint Reference'",
    'description: Auto-generated list of every Gusto Embedded API endpoint each SDK block and hook calls, with HTTP methods, paths, and URL parameters for proxy allowlisting.',
    '---',
    '',
    '<!-- AUTO-GENERATED FILE. Do not edit manually. Run "npm run endpoints:derive" to regenerate. -->',
    '',
    '# Endpoint Reference',
    '',
    'Every SDK component ("block") and headless hook makes a specific set of API calls. This reference lists them all, grouped by domain to match the [Reference](../reference/index.md) navigation. For a concise overview, see the [Proxy Security: Partner Guidance](../getting-started/proxy-security-partner-guidance.md).',
    '',
    "Within each domain, **Components** and **Hooks** list the endpoints they call, and **Flows** list the blocks they compose (a flow's endpoints are the union of its blocks' endpoints).",
    '',
    'Paths use named parameters (`:companyId`, `:employeeId`, etc.) that correspond to real IDs at runtime, and each links to its page in the API reference. This data is also available as a machine-readable JSON file at [`endpoint-inventory.json`](./endpoint-inventory.json), which includes the reference URL and the list of variables each block expects. For programmatic access, import it directly from the package:',
    '',
    '```typescript',
    "import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'",
    '```',
    '',
  ]

  const blocksByDomain = groupByDomainLabel(Object.entries(inventory.blocks), name =>
    namespaceToDomainLabel(name),
  )
  const flowsByDomain = groupByDomainLabel(Object.entries(inventory.flows), name =>
    namespaceToDomainLabel(name),
  )
  const hooksByDomain = groupByDomainLabel(
    Object.entries(inventory.hooks),
    name => hookDomains[name] ?? 'Other',
  )

  const present = new Set<string>([
    ...blocksByDomain.keys(),
    ...flowsByDomain.keys(),
    ...hooksByDomain.keys(),
  ])

  for (const domainLabel of orderDomainLabels(present)) {
    lines.push(`## ${domainLabel}`, '')

    const domainBlocks = blocksByDomain.get(domainLabel)
    if (domainBlocks?.length) {
      appendEndpointTable(lines, '### Components', 'Component', domainBlocks)
    }

    const domainFlows = flowsByDomain.get(domainLabel)
    if (domainFlows?.length) {
      lines.push('### Flows', '')
      lines.push('| Flow | Blocks included |')
      lines.push('| --- | --- |')
      for (const [flowName, entry] of domainFlows) {
        lines.push(`| **${flowName}** | ${entry.blocks.join(', ')} |`)
      }
      lines.push('')
    }

    const domainHooks = hooksByDomain.get(domainLabel)
    if (domainHooks?.length) {
      appendEndpointTable(lines, '### Hooks', 'Hook', domainHooks)
    }
  }

  return lines.join('\n')
}

function groupByDomainLabel<T>(
  entries: [string, T][],
  labelFor: (name: string) => string,
): Map<string, [string, T][]> {
  const grouped = new Map<string, [string, T][]>()
  for (const [name, value] of entries) {
    const label = labelFor(name)
    if (!grouped.has(label)) grouped.set(label, [])
    grouped.get(label)!.push([name, value])
  }
  return grouped
}

/** Sidebar domains first (in DOMAINS order), then any unmapped labels alphabetically. */
function orderDomainLabels(present: Set<string>): string[] {
  const known = DOMAIN_ORDER.filter(label => present.has(label))
  const extras = [...present].filter(label => !DOMAIN_ORDER.includes(label)).sort()
  return [...known, ...extras]
}

function appendEndpointTable(
  lines: string[],
  heading: string,
  columnLabel: string,
  entries: [string, BlockEntry][],
): void {
  lines.push(heading, '')
  lines.push(`| ${columnLabel} | Method | Path |`)
  lines.push('| --- | --- | --- |')
  for (const [name, entry] of entries) {
    let isFirst = true
    for (const ep of entry.endpoints) {
      const label = isFirst ? `**${name}**` : ''
      const pathCell = ep.docsUrl ? `[\`${ep.path}\`](${ep.docsUrl})` : `\`${ep.path}\``
      lines.push(`| ${label} | ${ep.method} | ${pathCell} |`)
      isFirst = false
    }
  }
  lines.push('')
}

function validateEndpoints(
  inventory: { blocks: Record<string, BlockEntry>; hooks: Record<string, BlockEntry> },
  funcLookup: Map<string, Endpoint>,
) {
  const apiEndpoints = new Set<string>()
  for (const ep of funcLookup.values()) {
    apiEndpoints.add(`${ep.method} ${ep.path}`)
  }

  const invalid: string[] = []
  const allEntries = [...Object.entries(inventory.blocks), ...Object.entries(inventory.hooks)]
  for (const [name, entry] of allEntries) {
    for (const ep of entry.endpoints) {
      const key = `${ep.method} ${ep.path}`
      if (!apiEndpoints.has(key)) {
        invalid.push(`${name}: ${key}`)
      }
    }
  }

  if (invalid.length > 0) {
    console.error(
      'WARNING: Some inventory endpoints were not found in @gusto/embedded-api-v-2026-02-01:',
    )
    for (const ep of invalid) console.error(`  ${ep}`)
    console.error('')
  }

  return invalid.length
}

function generate() {
  const { inventory, funcLookup, hookDomains } = deriveInventory()

  const invalidCount = validateEndpoints(inventory, funcLookup)

  mkdirSync(dirname(JSON_OUTPUT_PATH), { recursive: true })
  writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(inventory, null, 2) + '\n', 'utf-8')
  writeFileSync(MD_OUTPUT_PATH, generateMarkdown(inventory, hookDomains), 'utf-8')

  const blockCount = Object.keys(inventory.blocks).length
  const flowCount = Object.keys(inventory.flows).length
  const hookCount = Object.keys(inventory.hooks).length
  console.log(
    `Endpoint inventory written: ${blockCount} blocks, ${flowCount} flows, ${hookCount} hooks`,
  )
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

  const { inventory: freshInventory, funcLookup, hookDomains } = deriveInventory()
  const invalidCount = validateEndpoints(freshInventory, funcLookup)
  const freshJson = JSON.stringify(freshInventory, null, 2) + '\n'
  const freshMd = generateMarkdown(freshInventory, hookDomains)

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
  console.error('  - A hook added or removed an API function import, or a hook export changed')
  console.error('  - The @gusto/embedded-api-v-2026-02-01 package was updated')
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
