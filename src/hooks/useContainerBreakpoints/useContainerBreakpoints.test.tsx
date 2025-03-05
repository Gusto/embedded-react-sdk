import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { useContainerBreakpoints } from './useContainerBreakpoints'

const resizeObserver = mockResizeObserver()

beforeEach(() => {
  while (document.body.firstChild) {
    // Cleanup stray divs used to emulate container width
    document.body.removeChild(document.body.firstChild)
  }
})

afterEach(() => {
  vi.restoreAllMocks()
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
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })

    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base', 'small'])
    })

    expect(result.current).toStrictEqual(['base', 'small'])
  })

  test('should remove breakpoints when resized smaller', async () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    const { result } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    resizeObserver.mockElementSize(mockRef.current, {
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })

    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base', 'small'])
    })

    resizeObserver.mockElementSize(mockRef.current, {
      contentBoxSize: { inlineSize: 200, blockSize: 200 },
    })

    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(result.current).toStrictEqual(['base'])
    })
  })
})
