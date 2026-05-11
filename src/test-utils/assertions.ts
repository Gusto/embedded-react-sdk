import { expect } from 'vitest'

/** Asserts a value is neither null nor undefined, and narrows its type accordingly. */
export function assertDefined<T>(value: T | null | undefined): asserts value is T {
  expect(value).not.toBeNull()
  expect(value).not.toBeUndefined()
}

/** Asserts a value is an instance of the given constructor, and narrows its type accordingly. */
export function assertInstanceOf<T>(
  value: unknown,
  ctor: new (...args: never[]) => T,
): asserts value is T {
  expect(value).toBeInstanceOf(ctor)
}
