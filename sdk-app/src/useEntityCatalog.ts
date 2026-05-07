import { useEffect, useState } from 'react'
import {
  type EntityOption,
  type RawContractor,
  type RawEmployee,
  type RawPayroll,
  formatContractor,
  formatEmployee,
  formatPayPeriod,
} from './entityFormatters'

export interface EntityCatalog {
  employees: EntityOption[]
  contractors: EntityOption[]
  payrolls: EntityOption[]
  isLoading: boolean
}

const EMPTY_CATALOG: EntityCatalog = {
  employees: [],
  contractors: [],
  payrolls: [],
  isLoading: false,
}

async function fetchList<T>(path: string, signal: AbortSignal): Promise<T[]> {
  try {
    const res = await fetch(path, { signal })
    if (!res.ok) return []
    const data = (await res.json()) as unknown
    return Array.isArray(data) ? (data as T[]) : []
  } catch {
    return []
  }
}

export function useEntityCatalog(companyId: string): EntityCatalog {
  const [catalog, setCatalog] = useState<EntityCatalog>(EMPTY_CATALOG)

  const proxyMode = typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : 'none'
  const isFlowTokenMode = proxyMode === 'flow-token'

  useEffect(() => {
    if (!isFlowTokenMode || !companyId) {
      setCatalog(EMPTY_CATALOG)
      return
    }

    const controller = new AbortController()
    setCatalog(prev => ({ ...prev, isLoading: true }))

    const load = async () => {
      const base = `/api/v1/companies/${companyId}`
      const [employees, contractors, payrolls] = await Promise.all([
        fetchList<RawEmployee>(`${base}/employees`, controller.signal),
        fetchList<RawContractor>(`${base}/contractors`, controller.signal),
        fetchList<RawPayroll>(`${base}/payrolls`, controller.signal),
      ])

      if (controller.signal.aborted) return

      setCatalog({
        employees: employees
          .filter(e => !!e.uuid)
          .map(e => ({
            value: e.uuid as string,
            primary: formatEmployee(e),
            secondary: e.uuid as string,
          })),
        contractors: contractors
          .filter(c => !!c.uuid)
          .map(c => ({
            value: c.uuid as string,
            primary: formatContractor(c),
            secondary: c.uuid as string,
          })),
        payrolls: payrolls
          .filter(p => !!(p.payroll_uuid || p.uuid))
          .map(p => {
            const id = (p.payroll_uuid || p.uuid) as string
            return {
              value: id,
              primary: formatPayPeriod(p),
              secondary: id,
            }
          }),
        isLoading: false,
      })
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [companyId, isFlowTokenMode])

  return catalog
}
