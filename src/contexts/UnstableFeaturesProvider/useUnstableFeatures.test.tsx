import { render, renderHook, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import {
  UnstableFeaturesContext,
  useUnstableFeatures,
  type UnstableFeatures,
} from './useUnstableFeatures'
import { UnstableFeaturesProvider } from './UnstableFeaturesProvider'

/**
 * `UnstableFeatures` may have no active flags at any given time, so these tests exercise the
 * generic context/provider mechanics against a stand-in flag rather than a real one.
 */
type TestFlags = UnstableFeatures & { exampleFlag?: boolean }

function FlagsProbe() {
  const flags = useUnstableFeatures()
  return <div data-testid="flags">{JSON.stringify(flags)}</div>
}

describe('useUnstableFeatures', () => {
  test('returns an empty object when no provider is present', () => {
    const { result } = renderHook(() => useUnstableFeatures())
    expect(result.current).toEqual({})
  })

  test('returns the value supplied by UnstableFeaturesContext.Provider', () => {
    const { result } = renderHook(() => useUnstableFeatures(), {
      wrapper: ({ children }) => (
        <UnstableFeaturesContext.Provider value={{ exampleFlag: true } satisfies TestFlags}>
          {children}
        </UnstableFeaturesContext.Provider>
      ),
    })
    expect(result.current).toEqual({ exampleFlag: true })
  })

  test('UnstableFeaturesProvider defaults to an empty object when value is omitted', () => {
    const { result } = renderHook(() => useUnstableFeatures(), {
      wrapper: ({ children }) => <UnstableFeaturesProvider>{children}</UnstableFeaturesProvider>,
    })
    expect(result.current).toEqual({})
  })

  test('UnstableFeaturesProvider passes through the supplied value', () => {
    const { result } = renderHook(() => useUnstableFeatures(), {
      wrapper: ({ children }) => (
        <UnstableFeaturesProvider value={{ exampleFlag: true } satisfies TestFlags}>
          {children}
        </UnstableFeaturesProvider>
      ),
    })
    expect(result.current).toEqual({ exampleFlag: true })
  })

  test('UnstableFeaturesProvider keeps a stable context value when the caller passes a new object with the same flags', () => {
    const { result, rerender } = renderHook(() => useUnstableFeatures(), {
      wrapper: ({ children }) => (
        <UnstableFeaturesProvider value={{ exampleFlag: true } satisfies TestFlags}>
          {children}
        </UnstableFeaturesProvider>
      ),
    })
    const firstValue = result.current

    // Simulates a partner re-rendering with a fresh `unstableFeatures={{ ... }}` object literal.
    rerender()

    expect(result.current).toBe(firstValue)
  })

  test('UnstableFeaturesProvider still updates when a flag actually changes value', () => {
    const { rerender } = render(
      <UnstableFeaturesProvider value={{ exampleFlag: true } satisfies TestFlags}>
        <FlagsProbe />
      </UnstableFeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":true}')

    rerender(
      <UnstableFeaturesProvider value={{ exampleFlag: false } satisfies TestFlags}>
        <FlagsProbe />
      </UnstableFeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":false}')
  })
})
