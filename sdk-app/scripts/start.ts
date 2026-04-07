/* eslint-disable no-console */
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync, spawn } from 'child_process'

const ENV_DIR = resolve(import.meta.dirname, '../env')
const ROOT_DIR = resolve(import.meta.dirname, '../..')

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
  console.log(`  No env file found. Auto-provisioning ${zpEnv} environment...\n`)
  try {
    execSync(`npx tsx sdk-app/scripts/setup.ts`, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      env: { ...process.env, npm_config_env: zpEnv },
    })
    return true
  } catch {
    return false
  }
}

async function main() {
  const sdkBuild = process.argv[2] || 'dev'
  const envArg = process.argv.find(a => a.startsWith('--env='))
  const zpEnvInput = envArg?.split('=')[1] || process.env.npm_config_env || 'demo'
  const zpEnv = zpEnvInput === 'local' ? 'localzp' : zpEnvInput

  console.log(`\n  SDK Dev App`)
  console.log(`  Build: ${sdkBuild} | Environment: ${zpEnvInput}\n`)

  try {
    execSync('npx tsx sdk-app/scripts/analyze-component-props.ts', { cwd: ROOT_DIR, stdio: 'pipe' })
    console.log(`  Component props analyzed\n`)
  } catch {
    console.warn(`  Warning: Component prop analysis failed. Using existing data.\n`)
  }

  console.log(`  Generating i18n translations...`)
  try {
    execSync('npm run i18n:generate', { cwd: ROOT_DIR, stdio: 'pipe' })
    console.log(`  i18n translations generated\n`)
  } catch {
    console.warn(`  Warning: i18n generation failed. Using existing translations.\n`)
  }

  const envPath = resolve(ENV_DIR, `.env.${zpEnv}`)

  if (!existsSync(envPath) || !envIsUsable(loadEnvFile(envPath))) {
    const setupOk = runSetup(zpEnv)
    if (!setupOk || !existsSync(envPath)) {
      console.error(
        `\n  Auto-setup failed. You can try manually: npm run sdk-app:setup --env=${zpEnv}\n`,
      )
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
    console.warn(`  Warning: Token validation failed. The token may be expired.`)
    console.warn(`  Re-provisioning ${zpEnvInput} environment...\n`)
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

  if (sdkBuild === 'prod') {
    console.log(`  Building SDK for production...`)
    try {
      execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR })
    } catch {
      console.error(`  SDK build failed. Fix errors and try again.`)
      process.exit(1)
    }
    console.log('')
  }

  const viteArgs = ['vite', '--config', 'sdk-app/vite.config.ts', '--mode', zpEnv]
  const childEnv = {
    ...process.env,
    ZP_ENV: zpEnv,
    SDK_BUILD: sdkBuild,
  }

  // Start translation watcher in dev mode
  let translationWatcher: ReturnType<typeof spawn> | null = null
  if (sdkBuild === 'dev') {
    console.log(`  Starting translation watcher...\n`)
    translationWatcher = spawn('node', ['./build/translationWatcher.js'], {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    })

    translationWatcher.on('exit', code => {
      console.log(`  Translation watcher exited with code ${code}`)
    })
  }

  const viteChild = spawn('npx', viteArgs, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    env: childEnv,
  })

  viteChild.on('exit', code => {
    if (translationWatcher) {
      translationWatcher.kill()
    }
    process.exit(code ?? 0)
  })

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    if (translationWatcher) {
      translationWatcher.kill()
    }
    viteChild.kill()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    if (translationWatcher) {
      translationWatcher.kill()
    }
    viteChild.kill()
    process.exit(0)
  })
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
