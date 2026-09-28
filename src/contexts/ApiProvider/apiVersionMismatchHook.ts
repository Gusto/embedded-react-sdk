import { API_VERSION } from './apiVersion'
import type { AfterErrorHook, AfterSuccessHook } from '@/types/hooks'

function warnOnVersionMismatch(operationID: string, response: Response | null) {
  const responseVersion = response?.headers.get('X-Gusto-API-Version')
  if (responseVersion && responseVersion !== API_VERSION) {
    // eslint-disable-next-line no-console
    console.warn(
      `[@gusto/embedded-react-sdk] Requested API version ${API_VERSION} for "${operationID}", but the response reported version ${responseVersion}. This usually means something between the SDK and Gusto (e.g. a proxy) is rewriting the X-Gusto-API-Version header, which can cause the response to be parsed against the wrong schema.`,
    )
  }
}

/** @internal */
export const apiVersionMismatchHook: AfterSuccessHook & AfterErrorHook = {
  afterSuccess: (context, response) => {
    warnOnVersionMismatch(context.operationID, response)
    return response
  },
  afterError: (context, response, error) => {
    warnOnVersionMismatch(context.operationID, response)
    return { response, error }
  },
}
