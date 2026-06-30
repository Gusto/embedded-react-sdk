import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { NonceContext, useNonce } from './useNonce'

describe('useNonce', () => {
  test('returns undefined when no provider is present', () => {
    const { result } = renderHook(() => useNonce())
    expect(result.current).toBeUndefined()
  })

  test('returns the value supplied by NonceContext.Provider', () => {
    const { result } = renderHook(() => useNonce(), {
      wrapper: ({ children }) => (
        <NonceContext.Provider value="csp-test-nonce">{children}</NonceContext.Provider>
      ),
    })
    expect(result.current).toBe('csp-test-nonce')
  })
})
