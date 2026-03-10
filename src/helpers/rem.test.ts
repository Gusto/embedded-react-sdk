import { describe, it, expect, vi } from 'vitest'
import { getRootFontSize, toRem, remToPx } from './rem'

describe('rem helpers', () => {
  describe('getRootFontSize', () => {
    it('returns default font size of 16 when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR scenario
      delete global.window

      expect(getRootFontSize({ forceRefresh: true })).toBe('16')

      global.window = originalWindow
    })

    it('extracts font size from computed style', () => {
      const mockGetComputedStyle = vi.fn(() => ({
        getPropertyValue: () => '20px',
      }))
      global.window.getComputedStyle = mockGetComputedStyle as any

      expect(getRootFontSize({ forceRefresh: true })).toBe('20')
      expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement)
    })

    it('uses cached value on subsequent calls', () => {
      const mockGetComputedStyle = vi.fn(() => ({
        getPropertyValue: () => '18px',
      }))
      global.window.getComputedStyle = mockGetComputedStyle as any

      getRootFontSize({ forceRefresh: true })
      getRootFontSize()

      expect(mockGetComputedStyle).toHaveBeenCalledTimes(1)
    })

    it('refreshes cache when forceRefresh is true', () => {
      const mockGetComputedStyle = vi.fn(() => ({
        getPropertyValue: () => '24px',
      }))
      global.window.getComputedStyle = mockGetComputedStyle as any

      getRootFontSize({ forceRefresh: true })
      getRootFontSize({ forceRefresh: true })

      expect(mockGetComputedStyle).toHaveBeenCalledTimes(2)
    })
  })

  describe('toRem', () => {
    it('converts pixel values to rem', () => {
      vi.spyOn(global.window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '16px',
      } as unknown as CSSStyleDeclaration)
      getRootFontSize({ forceRefresh: true })

      expect(toRem(32)).toBe('2rem')
      expect(toRem(16)).toBe('1rem')
      expect(toRem(8)).toBe('0.5rem')
    })
  })

  describe('remToPx', () => {
    it('converts rem number to pixels', () => {
      vi.spyOn(global.window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '16px',
      } as unknown as CSSStyleDeclaration)
      getRootFontSize({ forceRefresh: true })
      expect(remToPx(2)).toBe(32)
      expect(remToPx(1)).toBe(16)
      expect(remToPx(0.5)).toBe(8)
    })

    it('converts rem string to pixels', () => {
      vi.spyOn(global.window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '16px',
      } as unknown as CSSStyleDeclaration)
      getRootFontSize({ forceRefresh: true })

      expect(remToPx('2rem')).toBe(32)
      expect(remToPx('1rem')).toBe(16)
      expect(remToPx('0.5rem')).toBe(8)
    })
  })
})
