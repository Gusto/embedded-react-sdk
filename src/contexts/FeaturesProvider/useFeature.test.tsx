import { useContext } from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { FeaturesContext, useFeature, type Features } from './useFeature'
import { FeaturesProvider } from './FeaturesProvider'

/**
 * `Features` may have no active flags at any given time (and its real flags change as they are
 * retired), so these tests exercise the generic context/provider mechanics against a stand-in flag
 * layered on top of the real type. See `useUnstableFeature.test.tsx` for why this is not a
 * `declare module` augmentation.
 */
interface TestFlags extends Partial<Features> {
  exampleFlag?: boolean
}

const asTestFeatures = (flags: TestFlags): Features => flags as unknown as Features
const asTestFeatureKey = (key: keyof TestFlags): keyof Features => key as unknown as keyof Features

const EXAMPLE_FLAG = asTestFeatureKey('exampleFlag')

function FlagsProbe() {
  const flags = useContext(FeaturesContext)
  return <div data-testid="flags">{JSON.stringify(flags)}</div>
}

describe('FeaturesProvider', () => {
  test('keeps a stable context value when the caller passes a new object with the same flags', () => {
    const { result, rerender } = renderHook(() => useContext(FeaturesContext), {
      wrapper: ({ children }) => (
        <FeaturesProvider value={asTestFeatures({ exampleFlag: false })}>
          {children}
        </FeaturesProvider>
      ),
    })
    const firstValue = result.current

    rerender()

    expect(result.current).toBe(firstValue)
  })

  test('updates when a flag actually changes value', () => {
    const { rerender } = render(
      <FeaturesProvider value={asTestFeatures({ exampleFlag: true })}>
        <FlagsProbe />
      </FeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":true}')

    rerender(
      <FeaturesProvider value={asTestFeatures({ exampleFlag: false })}>
        <FlagsProbe />
      </FeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"exampleFlag":false}')
  })
})

describe('useFeature', () => {
  test('returns true when no provider is present', () => {
    const { result } = renderHook(() => useFeature(EXAMPLE_FLAG))
    expect(result.current).toBe(true)
  })

  test('returns true when the provider omits the flag', () => {
    const { result } = renderHook(() => useFeature(EXAMPLE_FLAG), {
      wrapper: ({ children }) => <FeaturesProvider value={{}}>{children}</FeaturesProvider>,
    })
    expect(result.current).toBe(true)
  })

  test('returns false when the flag is explicitly set to false', () => {
    const { result } = renderHook(() => useFeature(EXAMPLE_FLAG), {
      wrapper: ({ children }) => (
        <FeaturesProvider value={asTestFeatures({ exampleFlag: false })}>
          {children}
        </FeaturesProvider>
      ),
    })
    expect(result.current).toBe(false)
  })
})
