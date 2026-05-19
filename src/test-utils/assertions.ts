import { expect } from 'vitest'

type TupleOf<T, N extends number, R extends T[] = []> = R['length'] extends N
  ? R
  : TupleOf<T, N, [...R, T]>

/** Asserts a value is neither null nor undefined, and narrows its type accordingly. */
export function assertDefined<T>(value: T | null | undefined): asserts value is T {
  expect(value).not.toBeNull()
  expect(value).not.toBeUndefined()
}

/** Asserts an array has the given length, and narrows its type to a fixed-length tuple accordingly. */
export function assertLength<T, N extends number>(
  arr: T[],
  length: N,
): asserts arr is TupleOf<T, N> {
  expect(arr).toHaveLength(length)
}

/** Asserts a value is an instance of the given constructor, and narrows its type accordingly. */
export function assertInstanceOf<T>(
  value: unknown,
  ctor: new (...args: never[]) => T,
): asserts value is T {
  expect(value).toBeInstanceOf(ctor)
}

/** Asserts a hook result has finished loading, and narrows its type to the ready variant accordingly. */
export function assertNotLoading<T extends { isLoading: boolean }>(
  result: T,
): asserts result is Extract<T, { isLoading: false }> {
  expect(result.isLoading).toBe(false)
}

/** Expects a hook result has finished loading, and returns it narrowed to the ready variant. */
export function requireNotLoading<T extends { isLoading: boolean }>(
  result: T,
): Extract<T, { isLoading: false }> {
  assertNotLoading(result)
  return result
}
