/**
 * Whether `value` is an absolute HTTPS URL, safe to open in a new tab.
 *
 * @remarks
 * Rejects `javascript:`, `data:`, `http:`, relative paths, and malformed strings — anything
 * that isn't an unambiguous, network-fetched HTTPS resource.
 *
 * @internal
 */
export function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Opens `url` in a new tab via a synthetic anchor click, isolated from and not referring to
 * this window.
 *
 * @remarks
 * Validates `url` with {@link isValidHttpsUrl} before opening anything, so an API-controlled
 * `javascript:`/`data:`/non-HTTPS URL can never execute in or replace the host page.
 *
 * @returns Whether the tab was opened. `false` if `url` failed validation.
 * @internal
 */
export function openLinkInNewTab(url: string): boolean {
  if (!isValidHttpsUrl(url)) return false

  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}
