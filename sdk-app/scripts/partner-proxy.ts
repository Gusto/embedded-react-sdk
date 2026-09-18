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
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { Connect, ViteDevServer } from 'vite'
import { GustoEmbedded } from '@gusto/embedded-api'

interface TokenCache {
  token: string | null
  refreshToken: string
  expiresAt: number
}

/** Refresh this far before actual expiry so an in-flight request never races expiry. */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

// Also caches the access token + expiry, not just the refresh token: Vite restarts on
// every edit to this file or vite.config.ts, and without this, each restart would hit
// the refresh grant unconditionally even when the previous access token is still valid
// — wasteful, and each hit also rotates the (single-use) refresh token, so overlapping
// restarts can race and invalidate each other's grant.
//
// The rotated refresh token itself must persist across restarts too — but never back
// into sdk-app/env/: Vite's `envDir` watcher does a full config reload on any .env*
// change there, which would re-trigger this exact priming and loop forever. This cache
// lives outside that directory.
const RUNTIME_CACHE_PATH = resolve(import.meta.dirname, '.partner-refresh-token-cache.json')

interface RuntimeCache {
  /** The env file's REFRESH_TOKEN value this cache was derived from — lets a manual edit to .env.partner invalidate a stale cache instead of being silently overridden by it. */
  seedRefreshToken: string
  refreshToken: string
  accessToken: string
  expiresAt: number
}

function loadCache(seedRefreshToken: string): RuntimeCache | null {
  if (!existsSync(RUNTIME_CACHE_PATH)) return null
  try {
    const cache = JSON.parse(readFileSync(RUNTIME_CACHE_PATH, 'utf-8')) as RuntimeCache
    return cache.seedRefreshToken === seedRefreshToken ? cache : null
  } catch {
    return null
  }
}

function persistCache(cache: RuntimeCache): void {
  writeFileSync(RUNTIME_CACHE_PATH, JSON.stringify(cache, null, 2))
}

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
 * Mounts the direct-to-API partner proxy on the Vite dev server. Requires
 * `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` in `env`.
 */
export function registerPartnerApiProxy(server: ViteDevServer, env: Record<string, string>): void {
  const clientId = requireEnv(env, 'CLIENT_ID')
  const clientSecret = requireEnv(env, 'CLIENT_SECRET')
  const seedRefreshToken = requireEnv(env, 'REFRESH_TOKEN')
  const cached = loadCache(seedRefreshToken)

  const baseUrl = env.GUSTO_API_BASE_URL || 'https://api.gusto-demo.com'
  const trustedBase = new URL(baseUrl)
  const client = new GustoEmbedded({ serverURL: baseUrl })

  const cache: TokenCache = {
    token: cached?.accessToken ?? null,
    refreshToken: cached?.refreshToken ?? seedRefreshToken,
    expiresAt: cached?.expiresAt ?? 0,
  }

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
    cache.refreshToken = auth.refreshToken ?? cache.refreshToken

    persistCache({
      seedRefreshToken,
      refreshToken: cache.refreshToken,
      accessToken: cache.token,
      expiresAt: cache.expiresAt,
    })

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
        const requestPath = (req.url ?? '').replace(/^\/api/, '')
        // String concatenation let a path like `@evil.com/...` redirect this token-bearing fetch off-origin (SSRF).
        const resolvedUrl = new URL(requestPath, trustedBase)
        if (resolvedUrl.origin !== trustedBase.origin) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Partner proxy rejected an out-of-origin request' }))
          return
        }
        const upstreamUrl = resolvedUrl.toString()

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
