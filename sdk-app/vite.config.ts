import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import { scssPreprocessorOptions, svgrPlugin } from '../vite.config'
import { fetchEntityIds, ENTITY_ID_KEYS, entityIdToEnvVar } from './src/entity-config'
import { createDemoAndProvision, writeEnvFile, validateHost } from './scripts/demo-provisioner'

const SDK_APP_DEFAULT_PORT = 5200

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
    vars[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim()
  }
  return vars
}

export default defineConfig(() => {
  const zpEnv = process.env.ZP_ENV || 'demo'
  const sdkBuild = process.env.SDK_BUILD || 'dev'
  const isProd = sdkBuild === 'prod'
  const env = loadEnvFile(zpEnv)

  const hasFlowToken = !!(env.FLOW_TOKEN && env.GWS_FLOWS_HOST)
  const proxyMode = hasFlowToken ? 'flow-token' : null

  const proxyConfig = hasFlowToken
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

  const aliases: Record<string, string> = {
    '@': sdkSrcPath,
  }
  if (isProd) {
    aliases['@gusto/embedded-react-sdk'] = resolve(__dirname, '../dist/index.js')
  }

  return {
    root: resolve(__dirname),
    publicDir: resolve(__dirname, 'public'),
    envDir: resolve(__dirname, 'env'),
    plugins: [
      react(),
      svgrPlugin(),
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

              let safeHost: string
              try {
                safeHost = validateHost(host)
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: `Disallowed host: ${host}` }))
                return
              }

              const flowType = demoType || 'react_sdk_demo_company_onboarded'

              const result = await createDemoAndProvision(safeHost, flowType)

              const envFilePath = resolve(__dirname, `env/.env.${zpEnv}`)
              writeEnvFile(envFilePath, { ...result, gwsFlowsHost: host })

              env.FLOW_TOKEN = result.flowToken
              env.GWS_FLOWS_HOST = host
              env.VITE_COMPANY_ID = result.companyId
              for (const key of ENTITY_ID_KEYS) {
                if (result.entities[key]) env[entityIdToEnvVar(key)] = result.entities[key]!
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  flowToken: result.flowToken,
                  companyId: result.companyId,
                  entities: result.entities,
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

              let safeHost: string
              try {
                safeHost = validateHost(env.GWS_FLOWS_HOST || '')
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid or missing GWS_FLOWS_HOST' }))
                return
              }

              const baseUrl = `${safeHost}/fe_sdk/${env.FLOW_TOKEN}`
              const entities = await fetchEntityIds(baseUrl, companyId)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(entities))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })

          server.middlewares.use('/sdk-app/api/validate-token', async (_req, res) => {
            try {
              let safeHost: string
              try {
                safeHost = validateHost(env.GWS_FLOWS_HOST || '')
              } catch {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ valid: false, reason: 'Invalid host' }))
                return
              }

              const companyId = env.VITE_COMPANY_ID

              const testRes = await fetch(
                `${safeHost}/fe_sdk/${env.FLOW_TOKEN}/v1/companies/${companyId}/locations`,
                { signal: AbortSignal.timeout(10000) },
              )
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
      alias: aliases,
    },
    css: {
      preprocessorOptions: scssPreprocessorOptions,
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
  }
})
