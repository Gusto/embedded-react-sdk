import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRootFontSize, toRem, remToPx, resetRootFontSizeCache } from './rem'

describe('getRootFontSize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRootFontSizeCache()
  })

  it('returns default font size of 16 in SSR environment', () => {
    const result = getRootFontSize()
    expect(result).toBe('16')
  })

  it('caches the result after first call', () => {
    const spy = vi.spyOn(window, 'getComputedStyle')

    const first = getRootFontSize()
    const second = getRootFontSize()
    const third = getRootFontSize()

    expect(first).toBe(second)
    expect(second).toBe(third)
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  it('allows forcing a refresh of the cached value', () => {
    const spy = vi.spyOn(window, 'getComputedStyle')

    const first = getRootFontSize()
    const second = getRootFontSize({ forceRefresh: false })
    getRootFontSize({ forceRefresh: true })

    expect(first).toBe(second)
    expect(spy).toHaveBeenCalledTimes(2)

    spy.mockRestore()
  })

  it('falls back to 16 if font-size cannot be parsed', () => {
    const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'invalid',
    } as unknown as CSSStyleDeclaration)

    const result = getRootFontSize()
    expect(result).toBe('16')

    spy.mockRestore()
  })
})

describe('toRem', () => {
  beforeEach(() => {
    resetRootFontSizeCache()
  })

  it('converts pixel values to rem based on root font size', () => {
    const result = toRem(16)
    expect(result).toBe('1rem')
  })

  it('handles non-standard root font sizes', () => {
    const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '20px',
    } as unknown as CSSStyleDeclaration)

    const result = toRem(20)
    expect(result).toBe('1rem')

    spy.mockRestore()
  })

  it('converts fractional pixel values correctly', () => {
    const result = toRem(24)
    expect(result).toBe('1.5rem')
  })
})

describe('remToPx', () => {
  beforeEach(() => {
    resetRootFontSizeCache()
  })

  it('converts rem number to pixels', () => {
    const result = remToPx(1)
    expect(result).toBe(16)
  })

  it('converts rem string to pixels', () => {
    const result = remToPx('1rem')
    expect(result).toBe(16)
  })

  it('converts fractional rem values', () => {
    const result = remToPx(1.5)
    expect(result).toBe(24)
  })

  it('handles rem strings with decimals', () => {
    const result = remToPx('1.5rem')
    expect(result).toBe(24)
  })
})
