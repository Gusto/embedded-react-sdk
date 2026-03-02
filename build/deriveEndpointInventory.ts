import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync, existsSync } from 'fs'
import { join, dirname, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Project, SyntaxKind } from 'ts-morph'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const FUNCS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api/src/funcs')
const OPS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api/src/models/operations')
const COMPONENTS_DIR = join(ROOT, 'src/components')
const JSON_OUTPUT_PATH = join(ROOT, 'docs/reference/endpoint-inventory.json')
const MD_OUTPUT_PATH = join(ROOT, 'docs/reference/endpoint-reference.md')

const isVerifyMode = process.argv.includes('--verify')

const NON_DOMAIN_DIRS = new Set(['Base', 'Common', 'Flow'])

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
  endpoints: Endpoint[]
  variables: string[]
}

// --- AST-based extraction from @gusto/embedded-api ---

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
    for (const match of path.matchAll(/\{([^}]+)\}/g)) {
      const snakeParam = match[1]
      if (!paramNameMap[snakeParam]) {
        paramNameMap[snakeParam] = snakeToCamelLookup.get(snakeParam) ?? snakeToCamel(snakeParam)
      }
    }
  }

  return paramNameMap
}

// --- Build a lookup from func name -> { method, path } ---

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

function buildFuncLookup(): Map<string, Endpoint> {
  const project = createApiProject()
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

// --- Recursively find source files in a directory ---

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

// --- Extract @gusto/embedded-api imports from component files ---

function extractApiImports(filePaths: string[]): Set<string> {
  const funcNames = new Set<string>()

  const hookImportPattern = /from\s+['"]@gusto\/embedded-api\/react-query\/([^'"]+)['"]/g
  const funcImportPattern = /from\s+['"]@gusto\/embedded-api\/funcs\/([^'"]+)['"]/g

  for (const filePath of filePaths) {
    const content = readFileSync(filePath, 'utf-8')

    for (const match of content.matchAll(hookImportPattern)) {
      const moduleName = match[1]
      if (!moduleName.startsWith('_')) {
        funcNames.add(moduleName)
      }
    }

    for (const match of content.matchAll(funcImportPattern)) {
      funcNames.add(match[1])
    }
  }

  return funcNames
}

// --- Normalize OpenAPI-style {param} paths to Express-style :param ---

function normalizeEndpointPath(openApiPath: string, paramNameMap: Record<string, string>): string {
  return openApiPath.replace(/\{([^}]+)\}/g, (_match, paramName: string) => {
    const normalized = paramNameMap[paramName]
    if (!normalized) {
      console.warn(`  Warning: Unknown param {${paramName}} in ${openApiPath}`)
      return `:${paramName}`
    }
    return `:${normalized}`
  })
}

// --- Map directory structure to block names ---

interface BlockMapping {
  blockName: string
  componentDir: string
}

function discoverDomains(): string[] {
  return readdirSync(COMPONENTS_DIR)
    .filter(entry => {
      const fullPath = join(COMPONENTS_DIR, entry)
      return statSync(fullPath).isDirectory() && !NON_DOMAIN_DIRS.has(entry)
    })
    .sort()
}

function buildExportNameMap(domainDir: string): Map<string, string> {
  const indexPath = join(domainDir, 'index.ts')
  const exportMap = new Map<string, string>()

  try {
    const content = readFileSync(indexPath, 'utf-8')
    const exportPattern = /export\s+\{\s*(\w+)(?:\s+as\s+\w+)?\s*\}\s+from\s+['"]\.\/([^'"\/]+)/g
    for (const match of content.matchAll(exportPattern)) {
      const exportedName = match[1]
      const dirName = match[2]
      exportMap.set(dirName, exportedName)
    }
  } catch {
    // no index.ts
  }

  return exportMap
}

function isNamespaceDir(dir: string): boolean {
  try {
    const entries = readdirSync(dir)
    const sourceFiles = entries.filter(e => /\.(ts|tsx)$/.test(e))
    const hasOnlyTypeFiles =
      sourceFiles.length === 0 || sourceFiles.every(f => /^types\.ts$|\.types\.ts$/.test(f))
    if (!hasOnlyTypeFiles) return false
    return entries.some(entry => {
      const fullPath = join(dir, entry)
      return statSync(fullPath).isDirectory() && !entry.endsWith('Flow')
    })
  } catch {
    return false
  }
}

function isDomainWithSubBlocks(domainDir: string): boolean {
  try {
    const entries = readdirSync(domainDir)
    const hasComponentFiles = entries.some(e => /\.tsx$/.test(e) && e !== 'index.tsx')
    if (hasComponentFiles) return false
    return entries.some(entry => {
      const fullPath = join(domainDir, entry)
      return statSync(fullPath).isDirectory()
    })
  } catch {
    return false
  }
}

function discoverBlocks(): BlockMapping[] {
  const blocks: BlockMapping[] = []
  const domains = discoverDomains()

  for (const domain of domains) {
    const domainDir = join(COMPONENTS_DIR, domain)

    if (!isDomainWithSubBlocks(domainDir)) {
      blocks.push({ blockName: domain, componentDir: domainDir })
      continue
    }

    const exportNames = buildExportNameMap(domainDir)

    try {
      const entries = readdirSync(domainDir)
      for (const entry of entries) {
        const fullPath = join(domainDir, entry)
        if (!statSync(fullPath).isDirectory()) continue
        if (entry.endsWith('Flow')) continue

        if (isNamespaceDir(fullPath)) {
          const nestedEntries = readdirSync(fullPath)
          for (const nestedEntry of nestedEntries) {
            const nestedPath = join(fullPath, nestedEntry)
            if (!statSync(nestedPath).isDirectory()) continue
            if (nestedEntry.endsWith('Flow')) continue
            blocks.push({
              blockName: `${domain}.${entry}.${nestedEntry}`,
              componentDir: nestedPath,
            })
          }
        } else {
          const resolvedName = exportNames.get(entry) ?? entry
          blocks.push({
            blockName: `${domain}.${resolvedName}`,
            componentDir: fullPath,
          })
        }
      }
    } catch {
      // domain dir doesn't exist
    }
  }

  return blocks
}

// --- Discover flow composition by scanning flow directory imports ---

interface FlowMapping {
  flowName: string
  flowDir: string
}

function discoverFlows(): FlowMapping[] {
  const flows: FlowMapping[] = []
  const domains = discoverDomains()

  for (const domain of domains) {
    const domainDir = join(COMPONENTS_DIR, domain)
    try {
      for (const entry of readdirSync(domainDir)) {
        const fullPath = join(domainDir, entry)
        if (!statSync(fullPath).isDirectory()) continue
        if (!entry.endsWith('Flow')) continue
        flows.push({ flowName: `${domain}.${entry}`, flowDir: fullPath })
      }
    } catch {
      // domain dir doesn't exist
      continue
    }

    try {
      const entries = readdirSync(domainDir)
      for (const entry of entries) {
        const subDir = join(domainDir, entry)
        if (!statSync(subDir).isDirectory()) continue
        if (entry.endsWith('Flow')) continue

        if (isNamespaceDir(subDir)) {
          for (const nestedEntry of readdirSync(subDir)) {
            const nestedPath = join(subDir, nestedEntry)
            if (!statSync(nestedPath).isDirectory()) continue
            if (!nestedEntry.endsWith('Flow')) continue
            flows.push({ flowName: `${domain}.${entry}.${nestedEntry}`, flowDir: nestedPath })
          }
        }
      }
    } catch {
      // doesn't exist
    }
  }

  return flows
}

function deriveFlowBlocks(flowDir: string, blockDirToName: Map<string, string>): string[] {
  const files = walkDir(flowDir)
  const blockNames = new Set<string>()

  const absoluteImportPattern = /from\s+['"]@\/components\/([^'"]+)['"]/g
  const relativeImportPattern = /from\s+['"](\.[^'"]+)['"]/g

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8')

    for (const match of content.matchAll(absoluteImportPattern)) {
      const importPath = match[1]
      if (
        importPath.startsWith('Flow/') ||
        importPath.startsWith('Base') ||
        importPath.startsWith('Common/')
      )
        continue
      const segments = importPath.split('/')
      const candidateDirs = [
        join(COMPONENTS_DIR, segments[0], segments[1] ?? ''),
        join(COMPONENTS_DIR, segments[0], segments[1] ?? '', segments[2] ?? ''),
      ]
      for (const dir of candidateDirs) {
        const name = blockDirToName.get(dir)
        if (name) blockNames.add(name)
      }
    }

    for (const match of content.matchAll(relativeImportPattern)) {
      const importPath = match[1]
      if (importPath.includes('/Flow/') || importPath.includes('useFlow')) continue
      const resolved = resolve(dirname(filePath), importPath)
      const segments = relative(COMPONENTS_DIR, resolved).split('/')
      const candidateDirs = [
        join(COMPONENTS_DIR, segments[0], segments[1] ?? ''),
        join(COMPONENTS_DIR, segments[0], segments[1] ?? '', segments[2] ?? ''),
      ]
      for (const dir of candidateDirs) {
        const name = blockDirToName.get(dir)
        if (name) blockNames.add(name)
      }
    }
  }

  return [...blockNames].sort()
}

// --- Extract variables from endpoint paths ---

function extractVariables(endpoints: Endpoint[]): string[] {
  const variables = new Set<string>()
  for (const ep of endpoints) {
    for (const match of ep.path.matchAll(/:([a-zA-Z]+)/g)) {
      variables.add(match[1])
    }
  }
  return [...variables].sort()
}

// --- Core derivation logic ---

interface Inventory {
  blocks: Record<string, BlockEntry>
  flows: Record<string, FlowEntry>
}

interface DerivationResult {
  inventory: Inventory
  funcLookup: Map<string, Endpoint>
}

function deriveInventory(): DerivationResult {
  const funcLookup = buildFuncLookup()
  const blockMappings = discoverBlocks()

  const blockDirToName = new Map<string, string>()
  for (const { blockName, componentDir } of blockMappings) {
    blockDirToName.set(componentDir, blockName)
  }

  const blocks: Record<string, BlockEntry> = {}

  for (const { blockName, componentDir } of blockMappings) {
    const files = walkDir(componentDir)
    const funcNames = extractApiImports(files)

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
    const blockNames = deriveFlowBlocks(flowDir, blockDirToName)

    const endpoints: Endpoint[] = []
    for (const blockName of blockNames) {
      const blockEntry = blocks[blockName]
      if (blockEntry) {
        endpoints.push(...blockEntry.endpoints)
      }
    }
    const deduped = deduplicateEndpoints(endpoints)
    flows[flowName] = {
      blocks: blockNames,
      endpoints: deduped,
      variables: extractVariables(deduped),
    }
  }

  return { inventory: { blocks, flows }, funcLookup }
}

function deduplicateEndpoints(endpoints: Endpoint[]): Endpoint[] {
  const seen = new Set<string>()
  return endpoints.filter(ep => {
    const key = `${ep.method} ${ep.path}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// --- Generate endpoint-reference.md from inventory ---

function generateMarkdown(inventory: Inventory): string {
  const lines: string[] = [
    '---',
    "title: 'Endpoint Reference'",
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
    const sectionTitle = `${domain} components`
    lines.push(`## ${sectionTitle}`, '')
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

// --- Validate all inventory endpoints exist in @gusto/embedded-api ---

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
    console.error('WARNING: Some inventory endpoints were not found in @gusto/embedded-api:')
    for (const ep of invalid) console.error(`  ${ep}`)
    console.error('')
  }

  return invalid.length
}

// --- Generate mode: write files ---

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

// --- Verify mode: compare against committed files, exit 1 if stale ---

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
  console.error('  - The @gusto/embedded-api package was updated')
  console.error('  - The pre-commit hook was bypassed (--no-verify)')
  console.error('')
  console.error('Fix: run "npm run endpoints:derive" and commit the updated files.')
  process.exit(1)
}

// --- Entry point ---

if (isVerifyMode) {
  verify()
} else {
  generate()
}
