const ENTITY_ENDPOINTS = {
  employeeId: 'employees',
  contractorId: 'contractors',
  payrollId: 'payrolls',
} as const

type EntityIdKey = keyof typeof ENTITY_ENDPOINTS

export interface EntityIds extends Record<EntityIdKey, string> {
  companyId: string
  requestId: string
}

/**
 * Entity IDs that have list endpoints and can be auto-fetched.
 * companyId and requestId are excluded -- companyId is fetched separately
 * via /v1/companies, and requestId has no list endpoint.
 */
export const ENTITY_ID_KEYS = Object.keys(ENTITY_ENDPOINTS) as EntityIdKey[]

export function entityIdToEnvVar(key: string): string {
  return `VITE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
}

interface FetchEntityIdsOptions {
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function fetchEntityIds(
  proxyBase: string,
  companyId: string,
  options: FetchEntityIdsOptions = {},
): Promise<Partial<EntityIds>> {
  const results = await Promise.allSettled(
    Object.entries(ENTITY_ENDPOINTS).map(async ([key, endpoint]) => {
      const res = await fetch(`${proxyBase}/v1/companies/${companyId}/${endpoint}`, {
        headers: options.headers,
        signal: options.signal ?? AbortSignal.timeout(10000),
      })
      if (!res.ok) return [key, ''] as const
      const items = await res.json()
      const id = Array.isArray(items) && items.length > 0 ? (items[0].uuid as string) : ''
      return [key, id] as const
    }),
  )

  return Object.fromEntries(
    results
      .filter(
        (r): r is PromiseFulfilledResult<readonly [string, string]> => r.status === 'fulfilled',
      )
      .map(r => r.value),
  )
}

export async function fetchCompanyId(
  proxyBase: string,
  options: FetchEntityIdsOptions = {},
): Promise<string> {
  try {
    const res = await fetch(`${proxyBase}/v1/companies`, {
      headers: options.headers,
      signal: options.signal ?? AbortSignal.timeout(10000),
    })
    if (res.ok) {
      const companies = await res.json()
      if (Array.isArray(companies) && companies.length > 0) {
        return companies[0].uuid as string
      }
    }
  } catch {
    // Non-fatal
  }
  return ''
}
