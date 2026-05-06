import { describe, it, expect } from 'vitest'
import { dedupeFieldErrorMessages } from './dedupeFieldErrorMessages'

describe('dedupeFieldErrorMessages', () => {
  it('returns each distinct message with count 1', () => {
    expect(dedupeFieldErrorMessages(['a', 'b', 'c'])).toEqual([
      { message: 'a', count: 1 },
      { message: 'b', count: 1 },
      { message: 'c', count: 1 },
    ])
  })

  it('collapses exact duplicates into one entry with the count', () => {
    expect(dedupeFieldErrorMessages(['a', 'a', 'a'])).toEqual([{ message: 'a', count: 3 }])
  })

  it('preserves order of first occurrence when mixing duplicates and uniques', () => {
    expect(dedupeFieldErrorMessages(['x', 'y', 'x', 'z', 'y', 'x'])).toEqual([
      { message: 'x', count: 3 },
      { message: 'y', count: 2 },
      { message: 'z', count: 1 },
    ])
  })

  it('skips empty strings', () => {
    expect(dedupeFieldErrorMessages(['', 'a', '', 'a'])).toEqual([{ message: 'a', count: 2 }])
  })

  it('returns an empty array for an empty input', () => {
    expect(dedupeFieldErrorMessages([])).toEqual([])
  })

  it('treats whitespace-only differences as distinct', () => {
    expect(dedupeFieldErrorMessages(['a', 'a ', 'a'])).toEqual([
      { message: 'a', count: 2 },
      { message: 'a ', count: 1 },
    ])
  })
})
