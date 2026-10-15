/** @internal */
export interface PdfTabHandle {
  navigate(blob: Blob): void
  /**
   * Navigates the reserved tab to `url` if it's an absolute HTTPS URL, closing the tab and
   * returning `false` otherwise. Returns `false` without closing anything if the tab itself
   * never opened (e.g. popup blocking).
   */
  navigateToUrl(url: string): boolean
  close(): void
}

/**
 * Whether `value` is an absolute HTTPS URL, safe to navigate a browser tab to.
 *
 * @remarks
 * Rejects `javascript:`, `data:`, `http:`, relative paths, and malformed strings -- anything
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
 * Opens a new browser tab with a loading spinner, returning a handle to navigate it to a PDF
 * blob or validated HTTPS URL, or close it on error.
 *
 * @remarks
 * Opens with `noopener` so the new tab can never reach back into this window via `window.opener`,
 * and sets a `no-referrer` policy on the page before any navigation so the destination never sees
 * this app's URL in its `Referer`.
 *
 * @internal
 */
export function openPdfInNewTab(options: { loadingMessage: string; nonce?: string }): PdfTabHandle {
  const newWindow = window.open('', '_blank', 'noopener')

  if (newWindow) {
    const doc = newWindow.document
    doc.title = options.loadingMessage
    const referrerMeta = doc.createElement('meta')
    referrerMeta.name = 'referrer'
    referrerMeta.content = 'no-referrer'
    doc.head.appendChild(referrerMeta)
    const style = doc.createElement('style')
    if (options.nonce) style.nonce = options.nonce
    style.textContent =
      'body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;' +
      'justify-content:center;height:100vh;margin:0;color:#444;gap:12px}' +
      '.spinner{width:20px;height:20px;border:2px solid #ccc;border-top-color:#444;' +
      'border-radius:50%;animation:spin .8s linear infinite}' +
      '@keyframes spin{to{transform:rotate(360deg)}}'
    doc.head.appendChild(style)
    const spinner = doc.createElement('div')
    spinner.className = 'spinner'
    spinner.setAttribute('aria-hidden', 'true')
    const label = doc.createElement('span')
    label.textContent = options.loadingMessage
    doc.body.replaceChildren(spinner, label)
  }

  return {
    navigate(blob: Blob) {
      const url = URL.createObjectURL(blob)
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          URL.revokeObjectURL(url)
        })
        newWindow.location.href = url
      } else {
        URL.revokeObjectURL(url)
      }
    },
    navigateToUrl(url: string) {
      if (!isValidHttpsUrl(url)) {
        if (newWindow) newWindow.close()
        return false
      }
      if (newWindow) newWindow.location.href = url
      return newWindow !== null
    },
    close() {
      if (newWindow) newWindow.close()
    },
  }
}
