interface PdfTabHandle {
  navigate(blob: Blob): void
  close(): void
}

/**
 * Opens a new browser tab with a loading spinner, returning a handle to
 * navigate it to a PDF blob or close it on error.
 *
 * @internal
 */
export function openPdfInNewTab(options: { loadingMessage: string; nonce?: string }): PdfTabHandle {
  const newWindow = window.open('', '_blank')

  if (newWindow) {
    const doc = newWindow.document
    doc.title = options.loadingMessage
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
    close() {
      if (newWindow) newWindow.close()
    },
  }
}
