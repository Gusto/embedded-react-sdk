import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach } from 'vitest'
import { vi } from 'vitest'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { useContainerBreakpoints } from './useContainerBreakpoints'

// Unmock the hook for these tests so we can test the actual implementation
vi.unmock('@/hooks/useContainerBreakpoints/useContainerBreakpoints')

const resizeObserver = mockResizeObserver()

beforeEach(() => {
  while (document.body.firstChild) {
    // Cleanup stray divs used to emulate container width
    document.body.removeChild(document.body.firstChild)
  }
})

describe('useContainerBreakpoints Hook', () => {
  test('should initialize with no active breakpoints', () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    const { result } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    expect(result.current).toEqual([])
  })

  test('should update breakpoints when resizing', async () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    const { result } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    resizeObserver.mockElementSize(mockRef.current, {
      contentBoxSize: { inlineSize: 650 },
    })

    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base', 'small'])
    })
  })

  test('should remove breakpoints when resized smaller', async () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    // Test with a shorter debounce timeout for this test
    const { result } = renderHook(() =>
      useContainerBreakpoints({
        ref: mockRef,
        debounceTimeout: 0, // No debouncing for this test
      }),
    )

    resizeObserver.mockElementSize(mockRef.current, {
      contentBoxSize: { inlineSize: 650 },
    })

    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base', 'small'])
    })

    resizeObserver.mockElementSize(mockRef.current, {
      contentBoxSize: { inlineSize: 200 },
    })

    act(() => {
      // According to jsdom-testing-mocks docs, we need to explicitly pass the element on subsequent calls
      resizeObserver.resize(mockRef.current)
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base'])
    })
  })
})
