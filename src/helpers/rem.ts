let cachedRootFontSize: string | null = null

/**
 * Detects font-size on the document root element with fallback to 16px which is the default browser setting.
 * The value is cached after the first call to avoid repeated expensive getComputedStyle() calls.
 * @param options.forceRefresh - Force a fresh detection instead of using the cached value
 * @returns The root font size in pixels as a string
 */
export function getRootFontSize(options?: { forceRefresh?: boolean }) {
  if (cachedRootFontSize && !options?.forceRefresh) {
    return cachedRootFontSize
  }

  const defaultFontSize = '16'

  if (typeof window === 'undefined') {
    cachedRootFontSize = defaultFontSize
    return defaultFontSize
  }

  const match = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('font-size')
    .match(/\d+/)

  cachedRootFontSize = match ? match[0] : defaultFontSize
  return cachedRootFontSize
}

export function toRem(pxValue: number) {
  return String(pxValue / Number(getRootFontSize())) + 'rem'
}

export const remToPx = (rem: string | number) =>
  typeof rem === 'number'
    ? Number(getRootFontSize()) * rem
    : Number(getRootFontSize()) * Number(rem.replace('rem', ''))

/**
 * Resets the cached root font size value.
 * @internal This function is only exported for testing purposes.
 */
export function resetRootFontSizeCache() {
  cachedRootFontSize = null
}
