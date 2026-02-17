const PRECISION_DIGITS = 12

function toCleanNumber(value: number): number {
  return parseFloat(value.toPrecision(PRECISION_DIGITS))
}

export function decimalToPercent(
  value: string | number | boolean | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
    return undefined
  }

  const numValue = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(numValue)) {
    return undefined
  }

  return toCleanNumber(numValue * 100)
}

export function percentToDecimal(value: number | string): string {
  const numValue = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(numValue)) {
    return String(value)
  }

  return String(toCleanNumber(numValue / 100))
}

export function formatPercentLabel(decimalValue: string, locale = 'en-US'): string {
  const percent = decimalToPercent(decimalValue)
  if (percent === undefined) return decimalValue

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 4,
  }).format(percent)

  return `${formatted}%`
}
