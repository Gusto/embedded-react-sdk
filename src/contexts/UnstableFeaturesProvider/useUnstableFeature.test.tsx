import { useContext } from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import {
  UnstableFeaturesContext,
  useUnstableFeature,
  type UnstableFeatures,
} from './useUnstableFeature'
import { UnstableFeaturesProvider } from './UnstableFeaturesProvider'

/**
 * `UnstableFeatures` may have no active flags at any given time (and its real flags change as
 * features graduate), so these tests exercise the generic context/provider mechanics against a
 * stand-in flag layered on top of the real type. Real flags are `Partial` here — on purpose — so
 * these tests never need to know about or supply whatever real flags currently exist.
 *
 * Deliberately not a `declare module` augmentation of the real `UnstableFeatures` interface:
 * module augmentation merges into the type for the whole program, so a stand-in flag declared that
 * way would leak into every other file's view of `UnstableFeatures`, not just this test file.
 */
interface TestFlags extends Partial<UnstableFeatures> {
  exampleFlag?: boolean
}

const asTestFeatures = (flags: TestFlags): UnstableFeatures => flags as unknown as UnstableFeatures
const asTestFeatureKey = (key: keyof TestFlags): keyof UnstableFeatures =>
  key as unknown as keyof UnstableFeatures

const EXAMPLE_FLAG = asTestFeatureKey('exampleFlag')

function FlagsProbe() {
  const flags = useContext(UnstableFeaturesContext)
  return <div data-testid="flags">{JSON.stringify(flags)}</div>
}

describe('UnstableFeaturesContext', () => {
  test('defaults to an empty object when no provider is present', () => {
    const { result } = renderHook(() => useContext(UnstableFeaturesContext))
    expect(result.current).toEqual({})
  })

  test('returns the value supplied by UnstableFeaturesContext.Provider', () => {
    const { result } = renderHook(() => useContext(UnstableFeaturesContext), {
      wrapper: ({ children }) => (
        <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
          {children}
        </UnstableFeaturesContext.Provider>
      ),
    })
    expect(result.current).toEqual({ exampleFlag: true })
  })

  test('UnstableFeaturesProvider defaults to an empty object when value is omitted', () => {
    const { result } = renderHook(() => useContext(UnstableFeaturesContext), {
      wrapper: ({ children }) => <UnstableFeaturesProvider>{children}</UnstableFeaturesProvider>,
    })
    expect(result.current).toEqual({})
  })

  test('UnstableFeaturesProvider passes through the supplied value', () => {
    const { result } = renderHook(() => useContext(UnstableFeaturesContext), {
      wrapper: ({ children }) => (
        <UnstableFeaturesProvider value={asTestFeatures({ exampleFlag: true })}>
          {children}
        </UnstableFeaturesProvider>
      ),
    })
    expect(result.current).toEqual({ exampleFlag: true })
  })

  test('UnstableFeaturesProvider keeps a stable context value when the caller passes a new object with the same flags', () => {
    const { result, rerender } = renderHook(() => useContext(UnstableFeaturesContext), {
      wrapper: ({ children }) => (
        <UnstableFeaturesProvider value={asTestFeatures({ exampleFlag: true })}>
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
      <UnstableFeaturesProvider value={asTestFeatures({ exampleFlag: true })}>
        <FlagsProbe />
      </UnstableFeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":true}')

    rerender(
      <UnstableFeaturesProvider value={asTestFeatures({ exampleFlag: false })}>
        <FlagsProbe />
      </UnstableFeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":false}')
  })
})

describe('useUnstableFeature', () => {
  test('returns true when the flag is enabled', () => {
    const { result } = renderHook(() => useUnstableFeature(EXAMPLE_FLAG), {
      wrapper: ({ children }) => (
        <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
          {children}
        </UnstableFeaturesContext.Provider>
      ),
    })
    expect(result.current).toBe(true)
  })

  test('returns false when the flag is disabled or no provider is present', () => {
    const { result } = renderHook(() => useUnstableFeature(EXAMPLE_FLAG))
    expect(result.current).toBe(false)
  })

  test('does not throw when throwIfDisabled is set and the flag is enabled', () => {
    expect(() =>
      renderHook(
        () => {
          useUnstableFeature(EXAMPLE_FLAG, { throwIfDisabled: true })
        },
        {
          wrapper: ({ children }) => (
            <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
              {children}
            </UnstableFeaturesContext.Provider>
          ),
        },
      ),
    ).not.toThrow()
  })

  test('throws naming the flag when throwIfDisabled is set and the flag is disabled', () => {
    expect(() =>
      renderHook(
        () => {
          useUnstableFeature(EXAMPLE_FLAG, { throwIfDisabled: true })
        },
        {
          wrapper: ({ children }) => (
            <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: false })}>
              {children}
            </UnstableFeaturesContext.Provider>
          ),
        },
      ),
    ).toThrow('exampleFlag')
  })

  test('throws naming the flag when throwIfDisabled is set and no provider is present', () => {
    expect(() => {
      renderHook(() => {
        useUnstableFeature(EXAMPLE_FLAG, { throwIfDisabled: true })
      })
    }).toThrow('exampleFlag')
  })
})
