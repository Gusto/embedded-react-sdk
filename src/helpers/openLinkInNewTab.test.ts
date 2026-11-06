import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isValidHttpsUrl, openLinkInNewTab } from './openLinkInNewTab'

describe('isValidHttpsUrl', () => {
  it('accepts an absolute HTTPS URL', () => {
    expect(isValidHttpsUrl('https://example.com/form-123.pdf')).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'http://example.com/form-123.pdf',
    'invalid',
    '/form-123.pdf',
    '',
  ])('rejects an unsafe URL: %s', url => {
    expect(isValidHttpsUrl(url)).toBe(false)
  })
})

describe('openLinkInNewTab', () => {
  let anchorClickSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('opens a valid HTTPS URL in an isolated new tab and returns true', () => {
    const result = openLinkInNewTab('https://example.com/form-123.pdf')

    expect(result).toBe(true)
    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(anchorClickSpy.mock.contexts[0]).toHaveProperty(
      'href',
      'https://example.com/form-123.pdf',
    )
    expect(anchorClickSpy.mock.contexts[0]).toHaveProperty('target', '_blank')
    expect(anchorClickSpy.mock.contexts[0]).toHaveProperty('rel', 'noopener noreferrer')
  })

  it('does not open a tab for an unsafe URL and returns false', () => {
    const result = openLinkInNewTab('javascript:alert(1)')

    expect(result).toBe(false)
    expect(anchorClickSpy).not.toHaveBeenCalled()
  })
})
