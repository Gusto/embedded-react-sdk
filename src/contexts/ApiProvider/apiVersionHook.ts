import type { BeforeRequestHook } from '@/types/hooks'

const CURRENT_API_VERSION = '2026-06-15'

/** @internal */
export const apiVersionHook: BeforeRequestHook = {
  beforeRequest: (_context, request) => {
    request.headers.set('X-Gusto-API-Version', CURRENT_API_VERSION)
    return request
  },
}
