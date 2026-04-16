import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import { scssPreprocessorOptions, svgrPlugin } from '../vite.config'
import { validateHost } from '../sdk-app/scripts/demo-provisioner'

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
  const env = loadEnvFile(zpEnv)

  const hasFlowToken = !!(env.FLOW_TOKEN && env.GWS_FLOWS_HOST)

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

  return {
    root: resolve(__dirname),
    envDir: resolve(__dirname, 'env'),
    plugins: [
      react(),
      svgrPlugin(),
      {
        name: 'prototype-app-server-api',
        configureServer(server) {
          server.middlewares.use('/prototype-app/api/validate-token', async (_req, res) => {
            res.setHeader('Content-Type', 'application/json')

            if (!env.FLOW_TOKEN || !env.GWS_FLOWS_HOST) {
              res.end(JSON.stringify({ valid: false, reason: 'no_token' }))
              return
            }

            try {
              let safeHost: string
              try {
                safeHost = validateHost(env.GWS_FLOWS_HOST)
              } catch {
                res.end(JSON.stringify({ valid: false, reason: 'Invalid host' }))
                return
              }

              const companyId = env.VITE_COMPANY_ID

              const testRes = await fetch(
                `${safeHost}/fe_sdk/${env.FLOW_TOKEN}/v1/companies/${companyId}/locations`,
                { signal: AbortSignal.timeout(10000) },
              )
              res.end(JSON.stringify({ valid: testRes.ok, status: testRes.status }))
            } catch (err) {
              res.end(JSON.stringify({ valid: false, reason: String(err) }))
            }
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src'),
      },
    },
    css: {
      preprocessorOptions: scssPreprocessorOptions,
    },
    server: {
      port: 5300,
      strictPort: false,
      open: true,
      proxy: proxyConfig,
    },
  }
})
