import { useMemo } from 'react'
import { NumberFormatter } from '@internationalized/number'
import { useLocale } from '@/contexts/LocaleProvider'

/**Custom hook wrapping NumberFormatter and returing format method */
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
