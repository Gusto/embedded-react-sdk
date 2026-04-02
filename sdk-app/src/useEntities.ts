import { useState, useEffect, useCallback, useRef } from 'react'

export interface EntityIds {
  companyId: string
  employeeId: string
  contractorId: string
  payrollId: string
  requestId: string
}

const STORAGE_KEY = 'sdk-app-entity-ids'
const STORAGE_ENV_COMPANY_KEY = 'sdk-app-env-company-id'

function getEnvDefaults(): EntityIds {
  return {
    companyId: import.meta.env.VITE_COMPANY_ID || '',
    employeeId: import.meta.env.VITE_EMPLOYEE_ID || '',
    contractorId: import.meta.env.VITE_CONTRACTOR_ID || '',
    payrollId: import.meta.env.VITE_PAYROLL_ID || '',
    requestId: import.meta.env.VITE_REQUEST_ID || '',
  }
}

function loadFromStorage(envCompanyId: string): Partial<EntityIds> {
  try {
    const previousEnvCompany = localStorage.getItem(STORAGE_ENV_COMPANY_KEY) || ''
    if (envCompanyId && previousEnvCompany !== envCompanyId) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_ENV_COMPANY_KEY, envCompanyId)
      return {}
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Corrupt storage, ignore
  }
  return {}
}

function saveToStorage(ids: EntityIds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    if (ids.companyId) {
      localStorage.setItem(STORAGE_ENV_COMPANY_KEY, ids.companyId)
    }
  } catch {
    // Storage full or unavailable
  }
}

function hasMissingEntities(ids: EntityIds): boolean {
  return !ids.employeeId || !ids.contractorId || !ids.payrollId
}

export function useEntities() {
  const [entities, setEntities] = useState<EntityIds>(() => {
    const defaults = getEnvDefaults()
    const stored = loadFromStorage(defaults.companyId)
    return {
      companyId: stored.companyId || defaults.companyId,
      employeeId: stored.employeeId || defaults.employeeId,
      contractorId: stored.contractorId || defaults.contractorId,
      payrollId: stored.payrollId || defaults.payrollId,
      requestId: stored.requestId || defaults.requestId,
    }
  })

  const [isFetching, setIsFetching] = useState(false)
  const hasAutoFetched = useRef(false)

  useEffect(() => {
    saveToStorage(entities)
  }, [entities])

  const autoFetchEntities = useCallback(
    async (companyId?: string, { overwrite = false }: { overwrite?: boolean } = {}) => {
      const cid = companyId || entities.companyId
      if (!cid) return

      setIsFetching(true)
      try {
        const res = await fetch('/sdk-app/api/refresh-entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: cid }),
        })

        if (res.ok) {
          const data = await res.json()
          setEntities(prev => ({
            ...prev,
            companyId: cid,
            employeeId: overwrite
              ? data.employeeId || prev.employeeId
              : prev.employeeId || data.employeeId || '',
            contractorId: overwrite
              ? data.contractorId || prev.contractorId
              : prev.contractorId || data.contractorId || '',
            payrollId: overwrite
              ? data.payrollId || prev.payrollId
              : prev.payrollId || data.payrollId || '',
          }))
        }
      } catch {
        // Auto-fetch failure is non-fatal
      } finally {
        setIsFetching(false)
      }
    },
    [entities.companyId],
  )

  useEffect(() => {
    if (hasAutoFetched.current) return
    if (!entities.companyId) return

    const proxyMode =
      typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : 'none'
    if (proxyMode === 'none') return

    if (hasMissingEntities(entities)) {
      hasAutoFetched.current = true
      void autoFetchEntities(entities.companyId)
    }
  }, [entities, autoFetchEntities])

  const updateEntity = useCallback((key: keyof EntityIds, value: string) => {
    setEntities(prev => ({ ...prev, [key]: value }))
  }, [])

  const replaceEntities = useCallback((newEntities: Partial<EntityIds>) => {
    setEntities(prev => ({ ...prev, ...newEntities }))
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaults = getEnvDefaults()
    setEntities(defaults)
    hasAutoFetched.current = false
  }, [])

  return {
    entities,
    updateEntity,
    replaceEntities,
    resetToDefaults,
    autoFetchEntities,
    isFetching,
  }
}
