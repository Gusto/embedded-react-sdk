/**
 * Dev-server proxy for the gusto-sandbox-db commenting API.
 *
 * This powers the design-mode commenting spike. It runs only inside the Vite
 * dev server (configureServer), so none of this ships in any SDK build.
 *
 * Auth: the staging API accepts a WARP-attested Cloudflare Access JWT as a
 * bearer token. We obtain one with zero developer setup by fetching the
 * sandbox SPA over the developer's WARP tunnel and reading the
 * `CF_Authorization` cookie Cloudflare Access sets. The token is injected
 * server-side so it is never exposed to the browser. A `SANDBOX_TOKEN` env
 * var overrides this for non-WARP environments.
 *
 * Reads (GET comments) are public on the API; writes require the token, which
 * only resolves for Gusto users on WARP — satisfying "non-Gusto cannot comment".
 */
import type { Connect, ViteDevServer } from 'vite'
import { Agent, fetch as undiciFetch } from 'undici'

const SANDBOX_SPA_URL = 'https://gusto-sandbox.gusto.workers.dev/'
const STAGING_API_BASE = 'https://gusto-sandbox-db.staging.zp-int.com/api/v1'

/**
 * WARP performs TLS inspection with a corporate root CA that Node does not
 * trust out of the box. This dev-only dispatcher relaxes verification for the
 * two internal Gusto hosts we talk to. Scoped to these fetches only.
 */
const insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } })

interface TokenCache {
  token: string | null
  expiresAt: number
}

const cache: TokenCache = { token: null, expiresAt: 0 }

function decodeJwtExpiryMs(jwt: string): number {
  try {
    const payload = jwt.split('.')[1]
    if (!payload) return 0
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      exp?: number
    }
    return typeof json.exp === 'number' ? json.exp * 1000 : 0
  } catch {
    return 0
  }
}

/**
 * Returns a bearer token for the sandbox API, or null if one can't be obtained
 * (e.g. developer is not on WARP and hasn't set SANDBOX_TOKEN).
 */
export async function getSandboxToken(): Promise<string | null> {
  const override = process.env.SANDBOX_TOKEN
  if (override) return override

  const now = Date.now()
  if (cache.token && now < cache.expiresAt - 60_000) return cache.token

  try {
    const res = await undiciFetch(SANDBOX_SPA_URL, {
      redirect: 'manual',
      dispatcher: insecureDispatcher,
    })
    const setCookies = res.headers.getSetCookie?.() ?? []
    const match = setCookies.map(cookie => /CF_Authorization=([^;]+)/.exec(cookie)).find(Boolean)
    const token = match?.[1] ?? null

    if (token) {
      const exp = decodeJwtExpiryMs(token)
      cache.token = token
      cache.expiresAt = exp || now + 30 * 60_000
    }
    return token
  } catch {
    return null
  }
}

async function readBody(req: Connect.IncomingMessage): Promise<string> {
  let body = ''
  for await (const chunk of req) body += chunk
  return body
}

/**
 * Mounts the sandbox comments proxy on the Vite dev server. Browser code calls
 * `/sdk-app/api/sandbox/<path>` (e.g. `/me`, `/prototypes`,
 * `/prototypes/:id/comments`) and we forward to the staging API with the
 * bearer token attached.
 */
export function registerSandboxCommentsProxy(server: ViteDevServer): void {
  // Prime the token cache so the first browser request doesn't pay the cost.
  void getSandboxToken()

  server.middlewares.use('/sdk-app/api/sandbox', (req, res) => {
    void (async () => {
      try {
        const token = await getSandboxToken()
        const method = req.method ?? 'GET'
        const isWrite = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'

        if (isWrite && !token) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                'No sandbox token available. Connect to WARP, or set SANDBOX_TOKEN in your environment.',
            }),
          )
          return
        }

        const upstreamUrl = `${STAGING_API_BASE}${req.url ?? ''}`
        const headers: Record<string, string> = {
          Accept: 'application/json',
          'Content-Type': (req.headers['content-type'] as string) ?? 'application/json',
        }
        if (token) headers.Authorization = `Bearer ${token}`

        const body = isWrite ? await readBody(req) : undefined

        const upstream = await undiciFetch(upstreamUrl, {
          method,
          headers,
          body,
          dispatcher: insecureDispatcher,
        })

        const text = await upstream.text()
        res.statusCode = upstream.status
        res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json')
        res.end(text)
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Sandbox proxy error: ${String(err)}` }))
      }
    })()
  })
}
