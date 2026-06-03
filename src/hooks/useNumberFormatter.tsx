import { useMemo } from 'react'
import { NumberFormatter } from '@internationalized/number'
import { useLocale } from '@/contexts/LocaleProvider'

/**
 * Returns a locale-aware number formatter for currency or percentage values.
 *
 * @remarks
 * Wraps `NumberFormatter` from `@internationalized/number` with the SDK's current locale and
 * currency. Currency output uses two fraction digits; percentage output uses zero minimum and two
 * maximum. Percentages are divided by 100 before formatting because the Gusto API stores them as
 * whole numbers (e.g. `25` for 25%) rather than fractions.
 *
 * @param style - `'currency'` (default) or `'percent'`.
 * @returns A function that formats a numeric value into a localized string.
 * @internal
 */
const useNumberFormatter = (style: 'currency' | 'percent' = 'currency') => {
  const { locale, currency } = useLocale()
  return useMemo(() => {
    return (value: number) =>
      new NumberFormatter(locale, {
        style: style,
        currency: style === 'currency' ? currency : undefined,
        minimumFractionDigits: style === 'currency' ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(style === 'percent' ? value / 100 : value) //GustoAPI does not store percent values as fractions
  }, [style, currency, locale])
}

export default useNumberFormatter
