import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync, existsSync } from 'fs'
import { join, dirname, basename, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT = join(__dirname, '..')
const FUNCS_DIR = join(ROOT, 'node_modules/@gusto/embedded-api/src/funcs')
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
  endpoints: Endpoint[]
  variables: string[]
}

// --- Build a lookup from func name -> { method, path } ---

function buildFuncLookup(): Map<string, Endpoint> {
  const lookup = new Map<string, Endpoint>()
  const files = readdirSync(FUNCS_DIR).filter(f => f.endsWith('.ts'))

  for (const file of files) {
    const funcName = basename(file, '.ts')
    const content = readFileSync(join(FUNCS_DIR, file), 'utf-8')

    const pathMatch = content.match(/pathToFunc\(\s*\n?\s*"([^"]+)"/)
    const methodMatch = content.match(/method:\s*"(GET|POST|PUT|DELETE|PATCH)"/)

    if (pathMatch && methodMatch) {
      lookup.set(funcName, {
        method: methodMatch[1],
        path: normalizeEndpointPath(pathMatch[1]),
      })
    }
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
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.includes('.test.') && !entry.includes('.stories.')) {
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

const PARAM_NAME_MAP: Record<string, string> = {
  company_id: 'companyId',
  company_uuid: 'companyId',
  employee_id: 'employeeId',
  employee_uuid: 'employeeId',
  contractor_uuid: 'contractorUuid',
  contractor_id: 'contractorUuid',
  bank_account_uuid: 'bankAccountUuid',
  bank_account_id: 'bankAccountUuid',
  home_address_uuid: 'homeAddressUuid',
  work_address_uuid: 'workAddressUuid',
  job_id: 'jobId',
  job_uuid: 'jobId',
  compensation_id: 'compensationId',
  compensation_uuid: 'compensationId',
  garnishment_id: 'garnishmentId',
  garnishment_uuid: 'garnishmentId',
  form_id: 'formId',
  form_uuid: 'formId',
  payroll_id: 'payrollId',
  payroll_uuid: 'payrollId',
  pay_schedule_id: 'payScheduleId',
  pay_schedule_uuid: 'payScheduleId',
  location_uuid: 'locationUuid',
  location_id: 'locationUuid',
  state: 'state',
  payment_group_id: 'paymentGroupId',
  payment_group_uuid: 'paymentGroupId',
  contractor_payment_group_uuid: 'paymentGroupId',
  contractor_payment_id: 'paymentId',
  contractor_payment_uuid: 'paymentId',
  payment_id: 'paymentId',
  wire_in_request_id: 'wireInRequestId',
  wire_in_request_uuid: 'wireInRequestId',
  information_request_uuid: 'informationRequestId',
  information_request_id: 'informationRequestId',
  recovery_case_uuid: 'recoveryCaseId',
  recovery_case_id: 'recoveryCaseId',
  signatory_uuid: 'signatoryUuid',
  signatory_id: 'signatoryUuid',
  benefit_id: 'benefitId',
  company_benefit_id: 'companyBenefitId',
  employee_benefit_id: 'employeeBenefitId',
  department_uuid: 'departmentUuid',
  earning_type_uuid: 'earningTypeUuid',
  external_payroll_id: 'externalPayrollId',
  historical_employee_uuid: 'historicalEmployeeUuid',
  notification_uuid: 'notificationUuid',
  time_off_policy_uuid: 'timeOffPolicyUuid',
  webhook_subscription_uuid: 'webhookSubscriptionUuid',
  people_batch_uuid: 'peopleBatchUuid',
  company_attachment_uuid: 'companyAttachmentUuid',
  document_id: 'documentId',
  document_uuid: 'documentUuid',
  document_type: 'documentType',
  effective_year: 'effectiveYear',
  id: 'id',
  uuid: 'uuid',
  invoice_period: 'invoicePeriod',
  report_type: 'reportType',
  request_uuid: 'requestUuid',
}

function normalizeEndpointPath(openApiPath: string): string {
  return openApiPath.replace(/\{([^}]+)\}/g, (_match, paramName: string) => {
    const normalized = PARAM_NAME_MAP[paramName]
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

const BLOCK_NAME_OVERRIDES: Record<string, string> = {
  'Contractor.Submit': 'Contractor.ContractorSubmit',
  'Contractor.Profile': 'Contractor.ContractorProfile',
}

function discoverBlocks(): BlockMapping[] {
  const blocks: BlockMapping[] = []
  const topLevelDomains = ['Employee', 'Company', 'Contractor', 'Payroll']

  for (const domain of topLevelDomains) {
    const domainDir = join(COMPONENTS_DIR, domain)
    try {
      const entries = readdirSync(domainDir)
      for (const entry of entries) {
        const fullPath = join(domainDir, entry)
        if (!statSync(fullPath).isDirectory()) continue
        if (entry.endsWith('Flow')) continue

        if (domain === 'Contractor' && entry === 'Payments') {
          const paymentsEntries = readdirSync(fullPath)
          for (const payEntry of paymentsEntries) {
            const payFullPath = join(fullPath, payEntry)
            if (!statSync(payFullPath).isDirectory()) continue
            if (payEntry.endsWith('Flow')) continue
            blocks.push({
              blockName: `Contractor.Payments.${payEntry}`,
              componentDir: payFullPath,
            })
          }
        } else {
          const rawName = `${domain}.${entry}`
          const blockName = BLOCK_NAME_OVERRIDES[rawName] ?? rawName
          blocks.push({ blockName, componentDir: fullPath })
        }
      }
    } catch {
      // domain dir doesn't exist
    }
  }

  const infoRequestDir = join(COMPONENTS_DIR, 'InformationRequests')
  try {
    statSync(infoRequestDir)
    blocks.push({ blockName: 'InformationRequests', componentDir: infoRequestDir })
  } catch {
    // doesn't exist
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
  const topLevelDomains = ['Employee', 'Company', 'Contractor', 'Payroll']

  for (const domain of topLevelDomains) {
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
    }

    if (domain === 'Contractor') {
      const paymentsDir = join(domainDir, 'Payments')
      try {
        for (const entry of readdirSync(paymentsDir)) {
          const fullPath = join(paymentsDir, entry)
          if (!statSync(fullPath).isDirectory()) continue
          if (!entry.endsWith('Flow')) continue
          flows.push({ flowName: `Contractor.Payments.${entry}`, flowDir: fullPath })
        }
      } catch {
        // doesn't exist
      }
    }
  }

  return flows
}

function deriveFlowBlocks(
  flowDir: string,
  blockDirToName: Map<string, string>,
): string[] {
  const files = walkDir(flowDir)
  const blockNames = new Set<string>()

  const absoluteImportPattern = /from\s+['"]@\/components\/([^'"]+)['"]/g
  const relativeImportPattern = /from\s+['"](\.[^'"]+)['"]/g

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8')

    for (const match of content.matchAll(absoluteImportPattern)) {
      const importPath = match[1]
      if (importPath.startsWith('Flow/') || importPath.startsWith('Base') || importPath.startsWith('Common/')) continue
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

  const domainOrder = ['Employee', 'Company', 'Contractor', 'Payroll', 'InformationRequests']
  const blocksByDomain = new Map<string, [string, BlockEntry][]>()

  for (const [name, entry] of Object.entries(inventory.blocks)) {
    const domain = name.includes('.') ? name.split('.')[0] : name
    if (!blocksByDomain.has(domain)) blocksByDomain.set(domain, [])
    blocksByDomain.get(domain)!.push([name, entry])
  }

  for (const domain of domainOrder) {
    const domainBlocks = blocksByDomain.get(domain)
    if (!domainBlocks) continue

    const sectionTitle = domain === 'InformationRequests' ? 'Other components' : `${domain} components`
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
  lines.push('Flows compose multiple blocks into a single workflow. The endpoint list for a flow is the union of all its block endpoints.', '')
  lines.push('| Flow | Blocks included |')
  lines.push('| --- | --- |')

  for (const [flowName, entry] of Object.entries(inventory.flows)) {
    lines.push(`| **${flowName}** | ${entry.blocks.join(', ')} |`)
  }

  lines.push('')

  return lines.join('\n')
}

// --- Validate all inventory endpoints exist in @gusto/embedded-api ---

function validateEndpoints(inventory: { blocks: Record<string, BlockEntry> }, funcLookup: Map<string, Endpoint>) {
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
