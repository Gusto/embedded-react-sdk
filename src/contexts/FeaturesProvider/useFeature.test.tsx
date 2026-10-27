import { useContext } from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { FeaturesContext, useFeature } from './useFeature'
import { FeaturesProvider } from './FeaturesProvider'

function FlagsProbe() {
  const flags = useContext(FeaturesContext)
  return <div data-testid="flags">{JSON.stringify(flags)}</div>
}

describe('FeaturesProvider', () => {
  test('keeps a stable context value when the caller passes a new object with the same flags', () => {
    const { result, rerender } = renderHook(() => useContext(FeaturesContext), {
      wrapper: ({ children }) => (
        <FeaturesProvider value={{ regularRateOfPay: false }}>{children}</FeaturesProvider>
      ),
    })
    const firstValue = result.current

    rerender()

    expect(result.current).toBe(firstValue)
  })

  test('updates when a flag actually changes value', () => {
    const { rerender } = render(
      <FeaturesProvider value={{ regularRateOfPay: true }}>
        <FlagsProbe />
      </FeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"regularRateOfPay":true}')

    rerender(
      <FeaturesProvider value={{ regularRateOfPay: false }}>
        <FlagsProbe />
      </FeaturesProvider>,
    )
    expect(screen.getByTestId('flags')).toHaveTextContent('{"regularRateOfPay":false}')
  })
})

describe('useFeature', () => {
  test('returns true when no provider is present', () => {
    const { result } = renderHook(() => useFeature('regularRateOfPay'))
    expect(result.current).toBe(true)
  })

  test('returns true when the provider omits the flag', () => {
    const { result } = renderHook(() => useFeature('regularRateOfPay'), {
      wrapper: ({ children }) => <FeaturesProvider value={{}}>{children}</FeaturesProvider>,
    })
    expect(result.current).toBe(true)
  })

  test('returns false when the flag is explicitly set to false', () => {
    const { result } = renderHook(() => useFeature('regularRateOfPay'), {
      wrapper: ({ children }) => (
        <FeaturesProvider value={{ regularRateOfPay: false }}>{children}</FeaturesProvider>
      ),
    })
    expect(result.current).toBe(false)
  })
})
