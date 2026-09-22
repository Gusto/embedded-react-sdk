import { Key } from '@gusto/embedded-api/models/components/payrollblocker'
import type { AfterSuccessHook } from '@/types/hooks'

const PAYROLL_BLOCKERS_OPERATION_ID = 'get-v1-companies-payroll-blockers-company_uuid'
// Hack: We are currently missing a translation key for `SoftSuspended` so our app falls back
// on displaying "unknown blocker" and the raw message from the API. If we add a translation key,
// this will prevent us from displaying the real API error until we make this a properly open enum
const REMAPPED_KEY = Key.SoftSuspended
const KNOWN_KEYS: ReadonlySet<string> = new Set(Object.values(Key))

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: the backend can return payroll blocker
 * keys (e.g. `partner_tos_not_accepted`) that are deliberately excluded from the published OAS
 * enum, so the generated `Key` closed enum in `@gusto/embedded-api` doesn't recognize them and
 * `z.nativeEnum(Key)` throws instead of returning blockers -- breaking every
 * `usePayrollsGetBlockersSuspense` call site. Remaps any key outside the closed enum to
 * `needs_approval` so the response still validates and payroll still reports as blocked, instead
 * of the whole query throwing. Not scoped to a single known key, since the backend can introduce
 * others before the OAS/client catches up. Remove once the client supports lax enum parsing.
 *
 * @internal
 */
export const partnerTosNotAcceptedHook: AfterSuccessHook = {
  afterSuccess: async (context, response) => {
    if (context.operationID !== PAYROLL_BLOCKERS_OPERATION_ID) {
      return response
    }

    let blockers: unknown
    try {
      blockers = await response.clone().json()
    } catch {
      return response
    }

    if (!Array.isArray(blockers)) {
      return response
    }

    const isUnrecognizedBlocker = (blocker: unknown): blocker is { key: string } =>
      Boolean(blocker) &&
      typeof blocker === 'object' &&
      typeof (blocker as { key?: unknown }).key === 'string' &&
      !KNOWN_KEYS.has((blocker as { key: string }).key)

    if (!blockers.some(isUnrecognizedBlocker)) {
      return response
    }

    const remapped = blockers.map(blocker =>
      isUnrecognizedBlocker(blocker) ? { ...blocker, key: REMAPPED_KEY } : blocker,
    )

    return new Response(JSON.stringify(remapped), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  },
}
