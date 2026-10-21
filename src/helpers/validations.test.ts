import { describe, expect, it } from 'vitest'
import { nameValidation } from './validations'

describe('nameValidation', () => {
  it('trims surrounding whitespace instead of rejecting the name', () => {
    expect(nameValidation.safeParse('  Jane ')).toMatchObject({ success: true, data: 'Jane' })
  })

  it('accepts hyphenated and apostrophe names', () => {
    expect(nameValidation.safeParse("O'Brien-Smith")).toMatchObject({
      success: true,
      data: "O'Brien-Smith",
    })
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(nameValidation.safeParse('').success).toBe(false)
    expect(nameValidation.safeParse('   ').success).toBe(false)
  })

  it('rejects a malformed non-empty name', () => {
    expect(nameValidation.safeParse('J4ne').success).toBe(false)
  })
})
