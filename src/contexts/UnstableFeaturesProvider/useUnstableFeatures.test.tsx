import { render, renderHook, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import {
  UnstableFeaturesContext,
  useUnstableFeatures,
  useRequiredUnstableFeatures,
  type UnstableFeatures,
} from './useUnstableFeatures'
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
  otherFlag?: boolean
}

const asTestFeatures = (flags: TestFlags): UnstableFeatures => flags as unknown as UnstableFeatures
const asTestFeatureKey = (key: keyof TestFlags): keyof UnstableFeatures =>
  key as unknown as keyof UnstableFeatures

const EXAMPLE_FLAG = asTestFeatureKey('exampleFlag')
const OTHER_FLAG = asTestFeatureKey('otherFlag')

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
        <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
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
        <UnstableFeaturesProvider value={asTestFeatures({ exampleFlag: true })}>
          {children}
        </UnstableFeaturesProvider>
      ),
    })
    expect(result.current).toEqual({ exampleFlag: true })
  })

  test('UnstableFeaturesProvider keeps a stable context value when the caller passes a new object with the same flags', () => {
    const { result, rerender } = renderHook(() => useUnstableFeatures(), {
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

describe('useRequiredUnstableFeatures', () => {
  test('does not throw when every required flag is enabled', () => {
    expect(() =>
      renderHook(
        () => {
          useRequiredUnstableFeatures(EXAMPLE_FLAG)
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

  test('throws naming the flag when it is disabled', () => {
    expect(() =>
      renderHook(
        () => {
          useRequiredUnstableFeatures(EXAMPLE_FLAG)
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

  test('throws naming the flag when no provider is present', () => {
    expect(() => {
      renderHook(() => {
        useRequiredUnstableFeatures(EXAMPLE_FLAG)
      })
    }).toThrow('exampleFlag')
  })

  test('throws naming every missing flag when multiple are required', () => {
    expect(() =>
      renderHook(
        () => {
          useRequiredUnstableFeatures(EXAMPLE_FLAG, OTHER_FLAG)
        },
        {
          wrapper: ({ children }) => (
            <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
              {children}
            </UnstableFeaturesContext.Provider>
          ),
        },
      ),
    ).toThrow('otherFlag')
  })
})
