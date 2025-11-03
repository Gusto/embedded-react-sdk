type NullToUndefined<T> = T extends null
  ? undefined
  : T extends object
    ? { [K in keyof T]: NullToUndefined<T[K]> }
    : T

export function nullToUndefined<T>(value: T): NullToUndefined<T> {
  if (value === null) {
    return undefined as NullToUndefined<T>
  }

  if (Array.isArray(value)) {
    return value.map(item => nullToUndefined(item)) as NullToUndefined<T>
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = nullToUndefined(value[key])
      }
    }
    return result as NullToUndefined<T>
  }

  return value as NullToUndefined<T>
}
