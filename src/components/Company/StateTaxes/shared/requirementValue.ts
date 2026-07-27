/** @internal */
export function stringifyRequirementValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') return isNaN(value) ? '' : String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return String(value)
  return ''
}
