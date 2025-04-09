import { renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import type { RefObject } from 'react'
import { useForkRef } from './useForkRef'

describe('useForkRef', () => {
  test('should return null when all refs are null or undefined', () => {
    const { result } = renderHook(() => useForkRef(null))
    expect(result.current).toBeNull()
  })

  test('should set ref object values correctly', () => {
    const ref1: RefObject<string | null> = { current: null }
    const ref2: RefObject<string | null> = { current: null }

    const { result } = renderHook(() => useForkRef(ref1, ref2))

    result.current?.('test-value')

    expect(ref1.current).toBe('test-value')
    expect(ref2.current).toBe('test-value')
  })

  test('should call ref functions correctly', () => {
    const refFn1 = vi.fn()
    const refFn2 = vi.fn()

    const { result } = renderHook(() => useForkRef(refFn1, refFn2))

    result.current?.('test-value')

    expect(refFn1).toHaveBeenCalledWith('test-value')
    expect(refFn2).toHaveBeenCalledWith('test-value')
  })

  test('should handle mixed ref types (object and function)', () => {
    const refObj: RefObject<string | null> = { current: null }
    const refFn = vi.fn()

    const { result } = renderHook(() => useForkRef(refObj, refFn))

    result.current?.('test-value')

    expect(refObj.current).toBe('test-value')
    expect(refFn).toHaveBeenCalledWith('test-value')
  })
})
