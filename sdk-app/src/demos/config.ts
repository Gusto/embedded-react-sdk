const STORAGE_KEY = 'sdk-app-entity-ids'
const STORAGE_ENV_COMPANY_KEY = 'sdk-app-env-company-id'

function readStoredEntities(envCompanyId: string): Record<string, string> {
  try {
    const previousEnvCompany = localStorage.getItem(STORAGE_ENV_COMPANY_KEY) || ''
    if (envCompanyId && previousEnvCompany !== envCompanyId) {
      // Env's company changed since the last visit (e.g. token refresh provisioned
      // a new demo company). Ignore any stored entity IDs from the previous session.
      return {}
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, string>
  } catch {
    // ignore corrupt storage
  }
  return {}
}

const env = import.meta.env
const stored = readStoredEntities(env.VITE_COMPANY_ID || '')

export const BASE_URL = `${window.location.origin}/api/`
export const COMPANY_ID = stored.companyId || env.VITE_COMPANY_ID || ''
export const EMPLOYEE_ID = stored.employeeId || env.VITE_EMPLOYEE_ID || ''
