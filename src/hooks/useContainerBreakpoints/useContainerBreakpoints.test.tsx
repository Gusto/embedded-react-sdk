import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { useContainerBreakpoints } from './useContainerBreakpoints'

vi.mock('./useDebounce', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  useDebounce: (fn: Function) => fn,
}))

// Global variables for ResizeObserver mock
let resizeCallback: (entries: ResizeObserverEntry[]) => void
let debounceMock = vi.fn()

interface ResizeObserverMock {
  observe: () => void
  unobserve: () => void
  disconnect: () => void
}

let resizeObserverMock: ResizeObserverMock

beforeEach(() => {
  resizeCallback = vi.fn()

  resizeObserverMock = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }

  global.ResizeObserver = vi.fn(callback => {
    resizeCallback = callback
    return resizeObserverMock
  })
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

  test.skip('should update breakpoints when resizing', () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    const { result } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    act(() => {
      resizeCallback([
        {
          contentRect: {
            width: 600,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
          target: mockRef.current,
        },
      ])
    })

    expect(result.current).toStrictEqual(['base', 'small'])
  })

  test.skip('should remove breakpoints when resized smaller', () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    const { result } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    // Simulate a large width
    act(() => {
      resizeCallback([
        {
          contentRect: {
            width: 650,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
          target: mockRef.current,
        },
      ])
    })

    expect(result.current).toStrictEqual(['base', 'small'])

    // Simulate shrinking
    act(() => {
      resizeCallback([
        {
          contentRect: {
            width: 300,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
          target: mockRef.current,
        },
      ])
    })

    expect(result.current).toStrictEqual(['base'])
  })

  test.skip('should debounce resize events', () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    debounceMock = vi.fn()
    vi.mock('./useDebounce', () => ({
      useDebounce:
        (fn: (...args: unknown[]) => void) =>
        (...args: unknown[]) => {
          debounceMock()
          fn(...args)
        },
    }))

    renderHook(() => useContainerBreakpoints({ ref: mockRef, debounceTimeout: 100 }))

    act(() => {
      resizeCallback([
        {
          contentRect: {
            width: 900,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            x: 0,
            y: 0,
            toJSON: function () {
              throw new Error('Function not implemented.')
            },
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
          target: mockRef.current,
        },
      ])
    })

    expect(debounceMock).toHaveBeenCalled()
  })

  test('should disconnect ResizeObserver on unmount', () => {
    const mockRef = { current: document.createElement('div') } as React.RefObject<HTMLElement>
    document.body.appendChild(mockRef.current)

    const { unmount } = renderHook(() => useContainerBreakpoints({ ref: mockRef }))

    unmount()

    expect(resizeObserverMock.disconnect).toHaveBeenCalledTimes(1)
  })
})
