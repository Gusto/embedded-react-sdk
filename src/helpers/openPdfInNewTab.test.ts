import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isValidHttpsUrl, openPdfInNewTab } from './openPdfInNewTab'

describe('isValidHttpsUrl', () => {
  it('accepts absolute HTTPS URLs', () => {
    expect(isValidHttpsUrl('https://example.com/checks.pdf?sig=abc')).toBe(true)
  })

  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['http://example.com/checks.pdf'],
    ['not a url'],
    ['/relative/path.pdf'],
  ])('rejects %s', url => {
    expect(isValidHttpsUrl(url)).toBe(false)
  })
})

describe('openPdfInNewTab', () => {
  let fakeWindow: {
    document: Document
    location: { href: string }
    close: ReturnType<typeof vi.fn>
  }
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fakeWindow = {
      document: document.implementation.createHTMLDocument(),
      location: { href: '' },
      close: vi.fn(),
    }
    openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeWindow as unknown as Window)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('opens the tab with opener isolation and a no-referrer policy', () => {
    openPdfInNewTab({ loadingMessage: 'Generating…' })

    expect(openSpy).toHaveBeenCalledWith('', '_blank', 'noopener')
    const referrerMeta = fakeWindow.document.querySelector('meta[name="referrer"]')
    expect(referrerMeta?.getAttribute('content')).toBe('no-referrer')
  })

  it('navigates to a valid HTTPS URL', () => {
    const handle = openPdfInNewTab({ loadingMessage: 'Generating…' })

    const navigated = handle.navigateToUrl('https://example.com/checks.pdf')

    expect(navigated).toBe(true)
    expect(fakeWindow.location.href).toBe('https://example.com/checks.pdf')
    expect(fakeWindow.close).not.toHaveBeenCalled()
  })

  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['http://example.com/checks.pdf'],
  ])('closes the tab instead of navigating to %s', url => {
    const handle = openPdfInNewTab({ loadingMessage: 'Generating…' })

    const navigated = handle.navigateToUrl(url)

    expect(navigated).toBe(false)
    expect(fakeWindow.location.href).toBe('')
    expect(fakeWindow.close).toHaveBeenCalledTimes(1)
  })

  it('does not throw when the popup was blocked', () => {
    openSpy.mockReturnValue(null)
    const handle = openPdfInNewTab({ loadingMessage: 'Generating…' })

    expect(() => {
      handle.navigateToUrl('https://example.com/checks.pdf')
    }).not.toThrow()
    expect(handle.navigateToUrl('https://example.com/checks.pdf')).toBe(false)
    expect(() => {
      handle.close()
    }).not.toThrow()
  })
})
