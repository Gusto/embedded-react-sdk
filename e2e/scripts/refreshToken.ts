import { chromium } from '@playwright/test'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DEFAULT_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'
const GWS_FLOWS_BASE = process.env.E2E_GWS_FLOWS_HOST || DEFAULT_GWS_FLOWS_HOST
const DEMO_URL = `${GWS_FLOWS_BASE}/demos?react_sdk=true`
const ENV_FILE_PATH = resolve(process.cwd(), 'e2e/local.config.env')
const isLocalHost = GWS_FLOWS_BASE.includes('localhost')

interface TokenInfo {
  flowToken: string
  companyId: string
}

function extractFlowTokenFromContent(pageContent: string): string {
  const iframeMatch = pageContent.match(/src="[^"]*\/app\/([a-zA-Z0-9_-]+)\/react_sdk/)
  if (iframeMatch) return iframeMatch[1]

  const appLinkMatch = pageContent.match(/\/app\/([a-zA-Z0-9_-]+)\/react_sdk/)
  if (appLinkMatch) return appLinkMatch[1]

  const feSdkMatch = pageContent.match(/fe_sdk\/([a-zA-Z0-9_-]{20,})/)
  if (feSdkMatch) return feSdkMatch[1]

  const flowsPathMatch = pageContent.match(/\/flows\/([a-zA-Z0-9_-]{20,})/)
  if (flowsPathMatch) return flowsPathMatch[1]

  return ''
}

export async function createFreshDemo(flowType: string = 'react_sdk_demo'): Promise<TokenInfo> {
  return extractTokenFromPage(flowType)
}

async function extractTokenFromPage(flowType: string = 'react_sdk_demo'): Promise<TokenInfo> {
  console.log('🔄 Launching browser to get fresh token from GWS-Flows...')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })

    const flowTypeSelect = page.locator('#demo_flow_type')
    await flowTypeSelect.selectOption(flowType)

    await page.waitForTimeout(500)

    const submitButton = page.getByRole('button', { name: /create/i })
    await submitButton.click()

    await page.waitForURL(/\/demos\/[a-f0-9-]+/, { timeout: 30000 })
    const demoPageUrl = page.url()
    console.log(`📍 Navigated to demo page: ${demoPageUrl}`)

    console.log('⏳ Waiting for demo to be created...')

    let flowToken = ''
    let companyId = ''

    const maxAttempts = 40
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const readyHeading = page.getByRole('heading', { name: /your demo is ready/i })
      const isReady = await readyHeading.isVisible().catch(() => false)

      if (isReady) {
        const flowLink = page.locator('a[href*="/flows/"]').first()
        const href = await flowLink.getAttribute('href')
        if (href) {
          const match = href.match(/\/flows\/([a-zA-Z0-9_-]+)/)
          if (match) {
            flowToken = match[1]
            console.log('  Found token from demo result link')
            break
          }
        }
      }

      if (attempt % 4 === 0) {
        console.log(`  Still waiting... (${attempt * 5}s)`)
      }

      await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(3000)
    }

    if (!flowToken) {
      throw new Error(
        `Could not find flow token after ${maxAttempts * 5}s. Demo creation may have timed out at ${GWS_FLOWS_BASE}.`,
      )
    }

    console.log(`✅ Found flow token: ${flowToken.slice(0, 15)}...`)

    if (!companyId) {
      try {
        const companyResponse = await fetch(`${GWS_FLOWS_BASE}/fe_sdk/${flowToken}/v1/companies`, {
          signal: AbortSignal.timeout(10000),
        })
        if (companyResponse.ok) {
          const companies = await companyResponse.json()
          if (Array.isArray(companies) && companies.length > 0) {
            companyId = companies[0].uuid
          }
        }
      } catch (apiError) {
        console.warn(`⚠️  Could not fetch company from API at ${GWS_FLOWS_BASE}`)
      }
    }

    if (!companyId) {
      const flowPageUrl = `${GWS_FLOWS_BASE}/flows/${flowToken}`
      await page.goto(flowPageUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(2000)

      const flowPageContent = await page.content()
      const companyMatch = flowPageContent.match(
        /company[_-]?(?:id|uuid)['":\s]+['"]?([a-f0-9-]{36})['"]?/i,
      )
      if (companyMatch) {
        companyId = companyMatch[1]
      }

      if (!companyId) {
        const uuidMatch = flowPageContent.match(
          /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
        )
        if (uuidMatch && uuidMatch.length > 0) {
          for (const uuid of uuidMatch) {
            if (uuid !== flowToken) {
              companyId = uuid
              break
            }
          }
        }
      }
    }

    if (!companyId) {
      console.error('\n' + '='.repeat(60))
      console.error('❌ Could not find company ID')
      console.error('')
      if (isLocalHost) {
        console.error('This usually means ZP is not running. Please ensure:')
        console.error('  1. ZP is running (cd zp && bin/rails s -p 3000)')
        console.error('  2. GWS-Flows is running (cd gws-flows && bin/rails s -p 7777)')
        console.error('')
        console.error('Once both are running, re-run: npm run test:e2e:local')
      } else {
        console.error(`Could not retrieve company ID from ${GWS_FLOWS_BASE}`)
        console.error('The demo environment may be temporarily unavailable.')
      }
      console.error('='.repeat(60) + '\n')

      throw new Error(`Could not find company ID from ${GWS_FLOWS_BASE}`)
    }

    console.log(`✅ Got company ID: ${companyId}`)

    return { flowToken, companyId }
  } finally {
    await browser.close()
  }
}

function updateEnvFile(tokenInfo: TokenInfo): void {
  if (!existsSync(ENV_FILE_PATH)) {
    console.log('📝 No local env file found, skipping file update (CI mode)')
    return
  }

  let envContent = readFileSync(ENV_FILE_PATH, 'utf-8')

  envContent = envContent.replace(/^E2E_FLOW_TOKEN=.*$/m, `E2E_FLOW_TOKEN=${tokenInfo.flowToken}`)
  envContent = envContent.replace(/^E2E_COMPANY_ID=.*$/m, `E2E_COMPANY_ID=${tokenInfo.companyId}`)

  writeFileSync(ENV_FILE_PATH, envContent)
  console.log(`📝 Updated ${ENV_FILE_PATH}`)
}

async function testToken(flowToken: string, companyId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GWS_FLOWS_BASE}/fe_sdk/${flowToken}/v1/companies/${companyId}/locations`,
      { signal: AbortSignal.timeout(5000) },
    )
    return response.ok
  } catch {
    return false
  }
}

export async function refreshTokenIfNeeded(): Promise<TokenInfo> {
  const existingToken = process.env.E2E_FLOW_TOKEN || ''
  const existingCompanyId = process.env.E2E_COMPANY_ID || ''

  if (existingToken && existingCompanyId) {
    console.log('🔍 Testing existing token...')
    const isValid = await testToken(existingToken, existingCompanyId)

    if (isValid) {
      console.log('✅ Existing token is valid')
      return { flowToken: existingToken, companyId: existingCompanyId }
    }

    console.log('⚠️  Existing token is expired or invalid')
  }

  const newToken = await extractTokenFromPage()
  updateEnvFile(newToken)

  process.env.E2E_FLOW_TOKEN = newToken.flowToken
  process.env.E2E_COMPANY_ID = newToken.companyId

  return newToken
}

if (import.meta.url === `file://${process.argv[1]}`) {
  refreshTokenIfNeeded()
    .then(info => {
      console.log('\n=== Token Refresh Complete ===')
      console.log(`Flow Token: ${info.flowToken}`)
      console.log(`Company ID: ${info.companyId}`)
    })
    .catch(error => {
      console.error('❌ Failed to refresh token:', error)
      process.exit(1)
    })
}
