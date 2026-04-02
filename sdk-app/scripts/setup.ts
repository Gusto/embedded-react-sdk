/* eslint-disable no-console */
import { resolve } from 'path'
import { createDemoAndProvision, writeEnvFile } from './demo-provisioner'

const ENV_DIR = resolve(import.meta.dirname, '../env')

const ENV_DEFAULTS: Record<string, string> = {
  demo: 'https://flows.gusto-demo.com',
  staging: 'https://flows.gusto-staging.com',
  localzp: 'http://localhost:7777',
}

async function main() {
  const zpEnv = process.env.npm_config_env || 'demo'
  const demoType = process.env.npm_config_demo_type || 'react_sdk_demo_company_onboarded'

  console.log(`\n  SDK Dev App Setup`)
  console.log(`  Environment: ${zpEnv}\n`)

  const actualEnv = zpEnv === 'local' ? 'localzp' : zpEnv

  const envPath = resolve(ENV_DIR, `.env.${actualEnv}`)
  const gwsFlowsHost = ENV_DEFAULTS[actualEnv]

  if (!gwsFlowsHost) {
    console.error(`  Error: Unknown environment "${zpEnv}"`)
    console.error(`  Known environments: ${Object.keys(ENV_DEFAULTS).join(', ')}\n`)
    process.exit(1)
  }

  console.log(`  GWS-Flows host: ${gwsFlowsHost}`)
  console.log(`  Demo type: ${demoType}\n`)

  console.log(`  Checking connectivity...`)
  try {
    const healthRes = await fetch(`${gwsFlowsHost}/demos`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!healthRes.ok && healthRes.status !== 404) {
      console.warn(`  Warning: GWS-Flows returned status ${healthRes.status}`)
    } else {
      console.log(`  GWS-Flows is reachable\n`)
    }
  } catch (err) {
    console.error(`  Error: Cannot reach ${gwsFlowsHost}`)
    console.error(`  ${err}\n`)
    process.exit(1)
  }

  const result = await createDemoAndProvision(gwsFlowsHost, demoType, {
    onProgress: msg => {
      console.log(`  ${msg}`)
    },
  })

  writeEnvFile(envPath, { ...result, gwsFlowsHost })

  console.log(`\n  Environment file written: ${envPath}`)
  console.log(`\n  Setup complete! Run: npm run sdk-app-dev --env=${zpEnv}\n`)
}

main().catch((err: unknown) => {
  console.error(`\n  Setup failed: ${String(err)}\n`)
  process.exit(1)
})
