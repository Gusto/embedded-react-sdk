/**
 * Narrows a lax-mode API client's `OpenEnum<T>` value to one of the enum object's own literal
 * members, excluding the `Unrecognized<string>` branch produced for a value the SDK doesn't
 * recognize (e.g. a newer API member the installed SDK version predates).
 *
 * @remarks Always pass the enum object the *source* value was read from, not a differently-scoped
 * destination type that happens to share some members today — the two can diverge,
 * and narrowing against the wrong one silently treats a real, known value as unrecognized.
 *
 * @typeParam T - An SDK-generated `{ Member: "value" } as const` enum object.
 * @param value - The value to narrow.
 * @param enumObject - The enum object whose member values define "known."
 * @returns Whether `value` is one of `enumObject`'s own literal values.
 * @internal
 */
export function isKnownEnumValue<T extends Record<string, string>>(
  value: string | null | undefined,
  enumObject: T,
): value is T[keyof T] {
  return value != null && (Object.values(enumObject) as string[]).includes(value)
}

/**
 * Resolves a lax-mode API client's `OpenEnum<T>` value to itself when it's one of `enumObject`'s
 * own literal members, or to `fallback` otherwise — an `isKnownEnumValue` check plus a ternary, in
 * one call.
 *
 * @remarks Same source-vs-destination caveat as {@link isKnownEnumValue}: pass the enum object the
 * value was actually read from, not a differently-scoped type that happens to share members today.
 *
 * @typeParam T - An SDK-generated `{ Member: "value" } as const` enum object.
 * @typeParam F - The fallback's type, e.g. `undefined` or another member of `T`.
 * @param value - The value to resolve.
 * @param enumObject - The enum object whose member values define "known."
 * @param fallback - Returned when `value` isn't one of `enumObject`'s own literal values.
 * @returns `value` narrowed to `T[keyof T]`, or `fallback`.
 * @internal
 */
export function toKnownEnumValue<T extends Record<string, string>, F>(
  value: string | null | undefined,
  enumObject: T,
  fallback: F,
): T[keyof T] | F {
  return isKnownEnumValue(value, enumObject) ? value : fallback
}
