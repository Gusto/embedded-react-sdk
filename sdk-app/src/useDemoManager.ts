import { useState, useCallback, useEffect, useRef } from 'react'

export type TokenStatus = 'unknown' | 'checking' | 'valid' | 'expired'

const TOKEN_POLL_INTERVAL_MS = 60_000

interface DemoManagerState {
  tokenStatus: TokenStatus
  isCreatingDemo: boolean
  demoError: string | null
}

export function useDemoManager() {
  const [state, setState] = useState<DemoManagerState>({
    tokenStatus: 'unknown',
    isCreatingDemo: false,
    demoError: null,
  })
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const proxyMode = typeof __SDK_APP_PROXY_MODE__ !== 'undefined' ? __SDK_APP_PROXY_MODE__ : 'none'

  const checkTokenHealth = useCallback(async () => {
    setState(prev => {
      if (prev.tokenStatus === 'expired') return prev
      return { ...prev, tokenStatus: 'checking' }
    })

    try {
      const res = await fetch('/sdk-app/api/validate-token')
      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          tokenStatus: data.valid ? 'valid' : 'expired',
        }))
      } else {
        setState(prev => ({ ...prev, tokenStatus: 'expired' }))
      }
    } catch {
      setState(prev => ({ ...prev, tokenStatus: 'expired' }))
    }
  }, [])

  useEffect(() => {
    if (proxyMode === 'none') return

    void checkTokenHealth()

    pollRef.current = setInterval(() => {
      void checkTokenHealth()
    }, TOKEN_POLL_INTERVAL_MS)

    return () => {
      clearInterval(pollRef.current)
    }
  }, [proxyMode, checkTokenHealth])

  const createNewDemo = useCallback(
    async (demoType: string = 'react_sdk_demo_company_onboarded') => {
      setState(prev => ({ ...prev, isCreatingDemo: true, demoError: null }))

      try {
        const res = await fetch('/sdk-app/api/create-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demoType }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(data.error || `HTTP ${res.status}`)
        }

        const data = await res.json()
        setState(prev => ({
          ...prev,
          isCreatingDemo: false,
          tokenStatus: 'valid',
        }))

        return data as {
          flowToken: string
          companyId: string
          entities: Record<string, string>
          demoType: string
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setState(prev => ({
          ...prev,
          isCreatingDemo: false,
          demoError: message,
        }))
        return null
      }
    },
    [],
  )

  const refreshToken = useCallback(async () => {
    const result = await createNewDemo(import.meta.env.VITE_DEMO_TYPE || undefined)
    if (result) {
      window.location.reload()
    }
    return result
  }, [createNewDemo])

  return {
    ...state,
    proxyMode,
    checkTokenHealth,
    createNewDemo,
    refreshToken,
  }
}
