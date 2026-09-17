/**
 * Dev-server proxy that talks directly to the real Embedded API with a real
 * partner's own OAuth credentials, bypassing gws-flows entirely.
 *
 * Browser code calls `/api/v1/...` (same as flow-token mode); we forward to
 * `GUSTO_API_BASE_URL` with a company-scoped bearer token attached
 * server-side, so the token never reaches the browser.
 *
 * Requires an existing partner-managed company's `REFRESH_TOKEN` — there's no
 * "create a new onboarded company" step here. Mint one first (via `POST /v1/partner_managed_companies`),
 * then put its `companyUuid`/`refreshToken` in `sdk-app/env/.env.partner`.
 */
import { readFileSync, writeFileSync } from 'fs'
import type { Connect, ViteDevServer } from 'vite'
import { GustoEmbedded } from '@gusto/embedded-api'

interface TokenCache {
  token: string | null
  refreshToken: string
  expiresAt: number
}

/** Refresh this far before actual expiry so an in-flight request never races expiry. */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

async function readBody(req: Connect.IncomingMessage): Promise<string> {
  let body = ''
  for await (const chunk of req) body += String(chunk)
  return body
}

function requireEnv(env: Record<string, string>, key: string): string {
  const value = env[key]
  if (!value) {
    throw new Error(`registerPartnerApiProxy requires ${key} in the partner env file`)
  }
  return value
}

/**
 * Gusto's OAuth server rotates refresh tokens on every use — the previous one
 * is invalidated the moment a new one is issued. Without persisting the
 * rotated value, the next `sdk-app:partner` process reads the now-dead token
 * from disk and can never refresh again.
 */
function persistRefreshToken(envPath: string, refreshToken: string): void {
  const content = readFileSync(envPath, 'utf-8')
  const updated = content.replace(/^REFRESH_TOKEN=.*$/m, `REFRESH_TOKEN=${refreshToken}`)
  writeFileSync(envPath, updated)
}

/**
 * Mounts the direct-to-API partner proxy on the Vite dev server. Requires
 * `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` in the env file at `envPath`.
 */
export function registerPartnerApiProxy(
  server: ViteDevServer,
  env: Record<string, string>,
  envPath: string,
): void {
  const clientId = requireEnv(env, 'CLIENT_ID')
  const clientSecret = requireEnv(env, 'CLIENT_SECRET')
  const refreshToken = requireEnv(env, 'REFRESH_TOKEN')

  const baseUrl = env.GUSTO_API_BASE_URL || 'https://api.gusto-demo.com'
  const client = new GustoEmbedded({ serverURL: baseUrl })

  const cache: TokenCache = { token: null, refreshToken, expiresAt: 0 }

  async function getAccessToken(): Promise<string> {
    const now = Date.now()
    if (cache.token && now < cache.expiresAt - TOKEN_EXPIRY_BUFFER_MS) return cache.token

    const result = await client.introspection.oauthAccessToken({
      requestBody: {
        grantType: 'refresh_token',
        clientId,
        clientSecret,
        refreshToken: cache.refreshToken,
      },
    })

    const auth = result.authentication
    if (!auth?.accessToken) {
      throw new Error('Partner token refresh returned no access token')
    }

    cache.token = auth.accessToken
    cache.expiresAt = now + auth.expiresIn * 1000

    if (auth.refreshToken && auth.refreshToken !== cache.refreshToken) {
      cache.refreshToken = auth.refreshToken
      persistRefreshToken(envPath, auth.refreshToken)
    }

    return cache.token
  }

  // Prime the token cache so the first browser request doesn't pay the cost.
  void getAccessToken()

  server.middlewares.use('/api', (req, res) => {
    void (async () => {
      try {
        const token = await getAccessToken()
        const method = req.method ?? 'GET'
        const isWrite = method !== 'GET' && method !== 'HEAD'
        const upstreamUrl = `${baseUrl}${(req.url ?? '').replace(/^\/api/, '')}`

        const headers: Record<string, string> = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        }
        const contentType = req.headers['content-type']
        if (typeof contentType === 'string') headers['Content-Type'] = contentType
        const apiVersion = req.headers['x-gusto-api-version']
        if (typeof apiVersion === 'string') headers['X-Gusto-API-Version'] = apiVersion
        const sdkVersion = req.headers['x-gusto-sdk-version']
        if (typeof sdkVersion === 'string') headers['X-Gusto-SDK-Version'] = sdkVersion

        const body = isWrite ? await readBody(req) : undefined

        const upstream = await fetch(upstreamUrl, { method, headers, body })

        const text = await upstream.text()
        res.statusCode = upstream.status
        res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json')
        res.end(text)
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Partner proxy error: ${String(err)}` }))
      }
    })()
  })
}
