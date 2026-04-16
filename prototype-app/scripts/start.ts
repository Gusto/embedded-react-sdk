/* eslint-disable no-console */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync, spawn } from 'child_process'

const ENV_DIR = resolve(import.meta.dirname, '../env')
const ROOT_DIR = resolve(import.meta.dirname, '../..')

const ENV_DEFAULTS: Record<string, string> = {
  demo: 'https://flows.gusto-demo.com',
  staging: 'https://flows.gusto-staging.com',
  localzp: 'http://localhost:7777',
}

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const content = readFileSync(path, 'utf-8')
  const vars: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    vars[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim()
  }
  return vars
}

function envIsUsable(env: Record<string, string>): boolean {
  return !!(env.FLOW_TOKEN && env.GWS_FLOWS_HOST && env.VITE_COMPANY_ID)
}

async function validateToken(env: Record<string, string>): Promise<boolean> {
  const companyId = env.VITE_COMPANY_ID
  if (!companyId || !env.FLOW_TOKEN || !env.GWS_FLOWS_HOST) return false

  try {
    const url = `${env.GWS_FLOWS_HOST}/fe_sdk/${env.FLOW_TOKEN}/v1/companies/${companyId}/locations`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    return res.ok
  } catch {
    return false
  }
}

function runSetup(zpEnv: string): boolean {
  const gwsFlowsHost = ENV_DEFAULTS[zpEnv]
  if (!gwsFlowsHost) {
    console.error(`  Unknown environment: ${zpEnv}`)
    return false
  }

  console.log(`  Provisioning ${zpEnv} demo at ${gwsFlowsHost}...\n`)
  try {
    execSync(`npx tsx sdk-app/scripts/setup.ts`, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      env: { ...process.env, npm_config_env: zpEnv },
    })

    // Copy the env file from sdk-app to prototype-app
    const sdkEnvPath = resolve(ROOT_DIR, `sdk-app/env/.env.${zpEnv}`)
    const protoEnvPath = resolve(ENV_DIR, `.env.${zpEnv}`)
    if (existsSync(sdkEnvPath)) {
      mkdirSync(ENV_DIR, { recursive: true })
      copyFileSync(sdkEnvPath, protoEnvPath)
    }

    return true
  } catch {
    return false
  }
}

async function main() {
  const envArg = process.argv.find(a => a.startsWith('--env='))
  const zpEnvInput = envArg?.split('=')[1] || process.env.ZP_ENV || 'demo'
  const zpEnv = zpEnvInput === 'local' ? 'localzp' : zpEnvInput

  console.log(`\n  Prototype App`)
  console.log(`  Environment: ${zpEnvInput}\n`)

  const envPath = resolve(ENV_DIR, `.env.${zpEnv}`)

  if (!existsSync(envPath) || !envIsUsable(loadEnvFile(envPath))) {
    const setupOk = runSetup(zpEnv)
    if (!setupOk || !existsSync(envPath)) {
      console.error(`\n  Auto-setup failed.\n`)
      process.exit(1)
    }
  }

  const env = loadEnvFile(envPath)

  if (!env.FLOW_TOKEN || !env.GWS_FLOWS_HOST) {
    console.error(`  Error: Missing FLOW_TOKEN or GWS_FLOWS_HOST in ${envPath}`)
    process.exit(1)
  }

  console.log(`  Target: ${env.GWS_FLOWS_HOST}`)

  console.log(`  Validating token...`)
  const isValid = await validateToken(env)
  if (isValid) {
    console.log(`  Token is valid\n`)
  } else {
    console.warn(`  Token expired. Re-provisioning...\n`)
    const reSetupOk = runSetup(zpEnv)
    if (reSetupOk) {
      const freshEnv = loadEnvFile(envPath)
      const reValid = await validateToken(freshEnv)
      if (reValid) {
        console.log(`  Token refreshed successfully\n`)
      } else {
        console.warn(`  Token still invalid after refresh. Continuing anyway.\n`)
      }
    } else {
      console.warn(`  Re-provisioning failed. Continuing with expired token.\n`)
    }
  }

  const viteArgs = ['vite', '--config', 'prototype-app/vite.config.ts', '--mode', zpEnv]
  const childEnv = {
    ...process.env,
    ZP_ENV: zpEnv,
  }

  const child = spawn('npx', viteArgs, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    env: childEnv,
  })

  child.on('exit', code => {
    process.exit(code ?? 0)
  })
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
