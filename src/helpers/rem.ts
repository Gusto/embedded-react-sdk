/**
 * Detects font-size on the document root element with fallback to 16px wich is the default browser setting
 * @returns number
 */
export function getRootFontSize() {
  const defaultFontSize = '16'

  if (typeof window === 'undefined') {
    return defaultFontSize
  }

  const match = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('font-size')
    .match(/\d+/)
  return typeof match === 'string' ? match : defaultFontSize
}

export function toRem(pxValue: number) {
  return String(pxValue / Number(getRootFontSize())) + 'rem'
}
