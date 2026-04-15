export function coerceNaN(fallback: number) {
  return (val: unknown): number => {
    if (val === undefined || val === null) return fallback
    if (typeof val === 'number' && Number.isNaN(val)) return fallback
    return val as number
  }
}

export function coerceToISODate(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString().split('T')[0]!
  if (val === null || val === '' || val === undefined) return null
  return val as string
}

export function coerceStringBoolean(val: unknown): boolean | undefined {
  if (typeof val === 'string') return val === 'true'
  return val as boolean | undefined
}
