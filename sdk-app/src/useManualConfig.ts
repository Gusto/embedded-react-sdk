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
  paymentId: string
}

interface PersistedShape {
  mode: AppMode
  config: ManualConfig
}

export type ManualConfigSaves = Record<string, ManualConfig>

const STORAGE_KEY = 'sdk-app-manual-config'
const SAVES_STORAGE_KEY = 'sdk-app-manual-config-saves'

const EMPTY_CONFIG: ManualConfig = {
  flowToken: '',
  companyId: '',
  employeeId: '',
  contractorId: '',
  payrollId: '',
  formId: '',
  requestId: '',
  paymentId: '',
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

function readSaves(): ManualConfigSaves {
  try {
    const raw = localStorage.getItem(SAVES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<ManualConfig>>
    const result: ManualConfigSaves = {}
    for (const [name, config] of Object.entries(parsed)) {
      result[name] = { ...EMPTY_CONFIG, ...config }
    }
    return result
  } catch {
    return {}
  }
}

function writeSaves(saves: ManualConfigSaves) {
  try {
    localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify(saves))
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
  saves: ManualConfigSaves
  saveConfig: (name: string, config: ManualConfig) => void
  deleteSave: (name: string) => void
}

export function useManualConfig(): UseManualConfigResult {
  const [{ mode, config }, setState] = useState<PersistedShape>(() => readPersisted())
  const [isReady, setIsReady] = useState<boolean>(() => readPersisted().mode !== 'manual')
  const [rehydrationError, setRehydrationError] = useState<string | null>(null)
  const [saves, setSaves] = useState<ManualConfigSaves>(() => readSaves())

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

  const saveConfig = useCallback((name: string, next: ManualConfig) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaves(prev => {
      const updated = { ...prev, [trimmed]: next }
      writeSaves(updated)
      return updated
    })
  }, [])

  const deleteSave = useCallback((name: string) => {
    setSaves(prev => {
      if (!(name in prev)) return prev
      const updated: ManualConfigSaves = {}
      for (const [k, v] of Object.entries(prev)) {
        if (k !== name) updated[k] = v
      }
      writeSaves(updated)
      return updated
    })
  }, [])

  return {
    mode,
    config,
    isReady,
    rehydrationError,
    switchToAuto,
    applyManualConfig,
    saves,
    saveConfig,
    deleteSave,
  }
}
