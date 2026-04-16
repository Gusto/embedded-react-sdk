import { useState, useCallback, useEffect, useRef } from 'react'

export type TokenStatus = 'unknown' | 'checking' | 'valid' | 'expired' | 'none'

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

  const checkTokenHealth = useCallback(async () => {
    setState(prev => {
      if (prev.tokenStatus === 'expired' || prev.tokenStatus === 'none') return prev
      return { ...prev, tokenStatus: 'checking' }
    })

    try {
      const res = await fetch('/prototype-app/api/validate-token')
      if (res.ok) {
        const data = await res.json()
        if (data.reason === 'no_token') {
          setState(prev => ({ ...prev, tokenStatus: 'none' }))
        } else {
          setState(prev => ({
            ...prev,
            tokenStatus: data.valid ? 'valid' : 'expired',
          }))
        }
      } else {
        setState(prev => ({ ...prev, tokenStatus: 'expired' }))
      }
    } catch {
      setState(prev => ({ ...prev, tokenStatus: 'expired' }))
    }
  }, [])

  useEffect(() => {
    void checkTokenHealth()

    pollRef.current = setInterval(() => {
      void checkTokenHealth()
    }, TOKEN_POLL_INTERVAL_MS)

    return () => {
      clearInterval(pollRef.current)
    }
  }, [checkTokenHealth])

  return {
    ...state,
    checkTokenHealth,
  }
}
