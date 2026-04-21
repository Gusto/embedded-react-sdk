import { useState, useEffect } from 'react'

export function useCompanyName(companyId: string) {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    setName('')
    if (!companyId) return

    fetch(`/api/v1/companies/${companyId}`, { signal: AbortSignal.timeout(10000) })
      .then(res => (res.ok ? (res.json() as Promise<{ name?: string }>) : null))
      .then(data => {
        if (data?.name) setName(data.name)
      })
      .catch(() => {})
  }, [companyId])

  return name
}
