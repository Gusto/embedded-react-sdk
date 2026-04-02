import { defineConfig, mergeConfig } from 'vite'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { createSharedConfig } from '../vite.config'
import {
  fetchEntityIds,
  fetchCompanyId,
  ENTITY_ID_KEYS,
  entityIdToEnvVar,
} from './src/entity-config'

const SDK_APP_DEFAULT_PORT = 5200

const ALLOWED_HOST_ORIGINS = new Set([
  'https://flows.gusto-demo.com',
  'https://flows.gusto-staging.com',
  'http://localhost:7777',
  'http://localhost:3000',
])

function isAllowedHost(host: string): boolean {
  try {
    const url = new URL(host)
    return ALLOWED_HOST_ORIGINS.has(url.origin) || url.hostname === 'localhost'
  } catch {
    return false
  }
}

function loadEnvFile(envName: string): Record<string, string> {
  const envPath = resolve(__dirname, `env/.env.${envName}`)
  if (!existsSync(envPath)) return {}

  const content = readFileSync(envPath, 'utf-8')
  const vars: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    vars[key] = value
  }
  return vars
}

function detectProxyMode(env: Record<string, string>) {
  if (env.ACCESS_TOKEN && env.ZP_API_URL) return 'direct' as const
  if (env.FLOW_TOKEN && env.GWS_FLOWS_HOST) return 'flow-token' as const
  return null
}

export default defineConfig(() => {
  const zpEnv = process.env.ZP_ENV || 'demo'
  const sdkBuild = process.env.SDK_BUILD || 'dev'
  const isProd = sdkBuild === 'prod'
  const env = loadEnvFile(zpEnv)
  const proxyMode = detectProxyMode(env)

  const proxyConfig =
    proxyMode === 'direct'
      ? {
          '/api': {
            target: env.ZP_API_URL,
            changeOrigin: true,
            secure: false,
            rewrite: (path: string) => path.replace(/^\/api/, ''),
            configure: (proxy: { on: Function }) => {
              proxy.on('proxyReq', (proxyReq: { setHeader: (k: string, v: string) => void }) => {
                proxyReq.setHeader('Authorization', `Bearer ${env.ACCESS_TOKEN}`)
                proxyReq.setHeader('X-Gusto-API-Version', '2025-11-15')
              })
            },
          },
        }
      : proxyMode === 'flow-token'
        ? {
            '/api': {
              target: env.GWS_FLOWS_HOST,
              changeOrigin: true,
              secure: !env.GWS_FLOWS_HOST?.includes('localhost'),
              rewrite: (path: string) => path.replace(/^\/api/, `/fe_sdk/${env.FLOW_TOKEN}`),
            },
          }
        : undefined

  const sdkSrcPath = resolve(__dirname, '../src')
  const shared = createSharedConfig(sdkSrcPath)

  const prodAliases = isProd
    ? { '@gusto/embedded-react-sdk': resolve(__dirname, '../dist/index.js') }
    : {}

  return mergeConfig(shared, {
    root: resolve(__dirname),
    publicDir: resolve(__dirname, 'public'),
    envDir: resolve(__dirname, 'env'),
    plugins: [
      {
        name: 'sdk-app-server-api',
        configureServer(server) {
          server.middlewares.use('/sdk-app/api/create-demo', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end('Method not allowed')
              return
            }

            try {
              let body = ''
              for await (const chunk of req) body += chunk

              const { gwsFlowsHost, demoType } = JSON.parse(body)
              const host = gwsFlowsHost || env.GWS_FLOWS_HOST
              if (!host) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'No GWS_FLOWS_HOST configured' }))
                return
              }

              if (!isAllowedHost(host)) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: `Disallowed host: ${host}` }))
                return
              }

              const flowType = demoType || 'react_sdk_demo_company_onboarded'
              const formBody = new URLSearchParams({
                'demo[flow_type]': flowType,
                'demo[admin_name]': 'SDK Dev',
                'demo[email]': 'sdk-dev@example.com',
                'demo[company_name]': `SDK Dev ${Date.now()}`,
              })

              const createRes = await fetch(`${host}/demos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody.toString(),
                redirect: 'follow',
              })

              const demoUrl = createRes.url
              const demoIdMatch = demoUrl.match(/\/demos\/([a-f0-9-]+)/)
              if (!demoIdMatch) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Could not extract demo ID from response' }))
                return
              }

              const demoId = demoIdMatch[1]
              let flowToken = ''
              let attempts = 0
              const maxAttempts = 60

              while (!flowToken && attempts < maxAttempts) {
                attempts++
                await new Promise(r => setTimeout(r, 3000))

                const pollRes = await fetch(`${host}/demos/${demoId}`)
                const html = await pollRes.text()

                const linkMatch = html.match(/https?:\/\/[^"]*\/flows\/([a-zA-Z0-9_-]{20,})/)
                if (linkMatch) {
                  flowToken = linkMatch[1]
                }
              }

              if (!flowToken) {
                res.statusCode = 504
                res.end(JSON.stringify({ error: 'Demo creation timed out' }))
                return
              }

              const proxyBase = `${host}/fe_sdk/${flowToken}`
              const companyId = await fetchCompanyId(proxyBase)
              const entities = companyId ? await fetchEntityIds(proxyBase, companyId) : {}

              const entityLines = ENTITY_ID_KEYS.map(
                key => `${entityIdToEnvVar(key)}=${entities[key] || ''}`,
              )
              const envContent = [
                `GWS_FLOWS_HOST=${host}`,
                `FLOW_TOKEN=${flowToken}`,
                `VITE_COMPANY_ID=${companyId}`,
                ...entityLines,
                `VITE_REQUEST_ID=`,
                `VITE_DEMO_TYPE=${flowType}`,
              ].join('\n')

              const envFilePath = resolve(__dirname, `env/.env.${zpEnv}`)
              writeFileSync(envFilePath, envContent + '\n')

              env.FLOW_TOKEN = flowToken
              env.GWS_FLOWS_HOST = host
              env.VITE_COMPANY_ID = companyId
              for (const key of ENTITY_ID_KEYS) {
                if (entities[key]) env[entityIdToEnvVar(key)] = entities[key]
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  flowToken,
                  companyId,
                  entities,
                  demoType: flowType,
                }),
              )
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })

          server.middlewares.use('/sdk-app/api/refresh-entities', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end('Method not allowed')
              return
            }

            try {
              let body = ''
              for await (const chunk of req) body += chunk
              const { companyId } = JSON.parse(body)

              if (!companyId) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'companyId required' }))
                return
              }

              let baseUrl: string
              if (proxyMode === 'flow-token') {
                if (!env.GWS_FLOWS_HOST || !isAllowedHost(env.GWS_FLOWS_HOST)) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Invalid or disallowed GWS_FLOWS_HOST' }))
                  return
                }
                baseUrl = `${env.GWS_FLOWS_HOST}/fe_sdk/${env.FLOW_TOKEN}`
              } else if (proxyMode === 'direct') {
                baseUrl = env.ZP_API_URL!
              } else {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'No proxy configured' }))
                return
              }

              const headers: Record<string, string> = {}
              if (proxyMode === 'direct') {
                headers['Authorization'] = `Bearer ${env.ACCESS_TOKEN}`
                headers['X-Gusto-API-Version'] = '2025-11-15'
              }

              const entities = await fetchEntityIds(baseUrl, companyId, { headers })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(entities))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })

          server.middlewares.use('/sdk-app/api/validate-token', async (_req, res) => {
            try {
              let testUrl: string
              const companyId = env.VITE_COMPANY_ID
              const headers: Record<string, string> = {}

              if (proxyMode === 'flow-token') {
                if (!env.GWS_FLOWS_HOST || !isAllowedHost(env.GWS_FLOWS_HOST)) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ valid: false, reason: 'Invalid host' }))
                  return
                }
                testUrl = `${env.GWS_FLOWS_HOST}/fe_sdk/${env.FLOW_TOKEN}/v1/companies/${companyId}/locations`
              } else if (proxyMode === 'direct') {
                testUrl = `${env.ZP_API_URL}/v1/companies/${companyId}/locations`
                headers['Authorization'] = `Bearer ${env.ACCESS_TOKEN}`
                headers['X-Gusto-API-Version'] = '2025-11-15'
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ valid: false, reason: 'No proxy configured' }))
                return
              }

              const testRes = await fetch(testUrl, {
                headers,
                signal: AbortSignal.timeout(10000),
              })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ valid: testRes.ok, status: testRes.status }))
            } catch (err) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ valid: false, reason: String(err) }))
            }
          })
        },
      },
    ],
    resolve: {
      alias: prodAliases,
    },
    server: {
      port: SDK_APP_DEFAULT_PORT,
      strictPort: false,
      open: true,
      proxy: proxyConfig,
    },
    define: {
      __SDK_APP_ENV__: JSON.stringify(zpEnv),
      __SDK_APP_BUILD__: JSON.stringify(sdkBuild),
      __SDK_APP_PROXY_MODE__: JSON.stringify(proxyMode || 'none'),
    },
  })
})
