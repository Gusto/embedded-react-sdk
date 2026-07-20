import { API_VERSION } from './apiVersion'
import type { BeforeRequestHook } from '@/types/hooks'

/** @internal */
export const apiVersionHook: BeforeRequestHook = {
  beforeRequest: (_context, request) => {
    request.headers.set('X-Gusto-API-Version', API_VERSION)
    return request
  },
}
