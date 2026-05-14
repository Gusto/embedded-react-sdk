import { resolve } from 'path'
import { readdirSync, existsSync, readFileSync } from 'fs'
import { provisionScenario } from './runner'
import { clearCache } from './cache'

const SCENARIOS_DIR = resolve(process.cwd(), 'e2e/scenarios')

function discoverScenarios(domain?: string): string[] {
  const baseDir = domain ? resolve(SCENARIOS_DIR, domain) : SCENARIOS_DIR
  if (!existsSync(baseDir)) {
    console.error(`Scenarios directory not found: ${baseDir}`)
    process.exit(1)
  }

  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== 'schema' && entry.name !== 'fragments') {
        walk(resolve(dir, entry.name))
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(resolve(dir, entry.name))
      }
    }
  }
  walk(baseDir)
  return files
}

async function prewarm(domain?: string): Promise<void> {
  const scenarioFiles = discoverScenarios(domain)
  if (scenarioFiles.length === 0) {
    console.log(domain ? `No scenarios found for domain: ${domain}` : 'No scenarios found')
    return
  }

  console.log(`Prewarming ${scenarioFiles.length} scenario(s)...`)

  for (const scenarioPath of scenarioFiles) {
    const json = JSON.parse(readFileSync(scenarioPath, 'utf-8')) as { name?: string }
    const label = json.name ?? scenarioPath
    try {
      console.log(`  Provisioning: ${label}`)
      await provisionScenario(scenarioPath)
      console.log(`  ✓ ${label}`)
    } catch (err) {
      console.error(`  ✗ ${label}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

function parseDomainFlag(args: string[]): string | undefined {
  const idx = args.indexOf('--domain')
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1]
  const eqFlag = args.find(a => a.startsWith('--domain='))
  if (eqFlag) return eqFlag.split('=')[1]
  return undefined
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv
  const domain = parseDomainFlag(args)

  switch (command) {
    case 'prewarm':
      await prewarm(domain)
      break
    case 'clear':
      clearCache()
      console.log('Cache cleared')
      break
    default:
      console.error(`Usage: npx tsx e2e/scenario/scripts.ts <prewarm|clear> [--domain <domain>]`)
      process.exit(1)
  }
}

void main()
