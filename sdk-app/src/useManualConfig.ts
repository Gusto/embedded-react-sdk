import { useCallback, useEffect, useState } from 'react'

export type AppMode = 'auto' | 'manual'

export interface ManualConfig {
  flowToken: string
  companyId: string
  employeeId: string
  contractorId: string
  payrollId: string
  formId: string
  requestId: string
}

interface PersistedShape {
  mode: AppMode
  config: ManualConfig
}

const STORAGE_KEY = 'sdk-app-manual-config'

const EMPTY_CONFIG: ManualConfig = {
  flowToken: '',
  companyId: '',
  employeeId: '',
  contractorId: '',
  payrollId: '',
  formId: '',
  requestId: '',
}

function readPersisted(): PersistedShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { mode: 'auto', config: EMPTY_CONFIG }
    const parsed = JSON.parse(raw) as Partial<PersistedShape>
    const mode: AppMode = parsed.mode === 'manual' ? 'manual' : 'auto'
    const config: ManualConfig = { ...EMPTY_CONFIG, ...(parsed.config ?? {}) }
    return { mode, config }
  } catch {
    return { mode: 'auto', config: EMPTY_CONFIG }
  }
}

function writePersisted(shape: PersistedShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape))
  } catch {
    // Storage unavailable; continue without persistence.
  }
}

async function postManualToken(config: ManualConfig): Promise<void> {
  const res = await fetch('/sdk-app/api/set-manual-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || `HTTP ${res.status}`)
  }
}

async function postRestoreAuto(): Promise<void> {
  const res = await fetch('/sdk-app/api/restore-auto-token', { method: 'POST' })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || `HTTP ${res.status}`)
  }
}

export interface UseManualConfigResult {
  mode: AppMode
  config: ManualConfig
  isReady: boolean
  rehydrationError: string | null
  switchToAuto: () => Promise<void>
  applyManualConfig: (next: ManualConfig) => Promise<void>
}

export function useManualConfig(): UseManualConfigResult {
  const [{ mode, config }, setState] = useState<PersistedShape>(() => readPersisted())
  const [isReady, setIsReady] = useState<boolean>(() => readPersisted().mode !== 'manual')
  const [rehydrationError, setRehydrationError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'manual') {
      setIsReady(true)
      return
    }
    let cancelled = false
    setIsReady(false)
    setRehydrationError(null)
    void postManualToken(config)
      .catch((err: unknown) => {
        if (cancelled) return
        setRehydrationError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setIsReady(true)
      })
    return () => {
      cancelled = true
    }
    // Rehydrate only on mount; subsequent changes go through applyManualConfig.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchToAuto = useCallback(async () => {
    await postRestoreAuto()
    setState(prev => {
      const updated: PersistedShape = { mode: 'auto', config: prev.config }
      writePersisted(updated)
      return updated
    })
    setRehydrationError(null)
    setIsReady(true)
  }, [])

  const applyManualConfig = useCallback(async (next: ManualConfig) => {
    await postManualToken(next)
    const updated: PersistedShape = { mode: 'manual', config: next }
    writePersisted(updated)
    setState(updated)
    setRehydrationError(null)
    setIsReady(true)
  }, [])

  return { mode, config, isReady, rehydrationError, switchToAuto, applyManualConfig }
}
