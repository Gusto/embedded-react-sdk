let cachedRootFontSize: string | null = null

/**
 * Reads the font size of the document root element, falling back to `'16'` when running outside the browser or when the value cannot be parsed.
 *
 * @remarks
 * The first call resolves the value via `getComputedStyle(document.documentElement)` and caches it
 * for subsequent calls, since `getComputedStyle` triggers layout. Pass `forceRefresh: true` to
 * recompute, e.g. after a theme change that adjusts the root font size.
 *
 * @param options - Optional flags. Set `forceRefresh` to `true` to bypass the cache and recompute the value.
 * @returns The root font size in pixels as a numeric string (no `px` suffix)
 * @internal
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

/**
 * Converts a pixel value into a `rem`-suffixed string relative to the document root font size.
 *
 * @param pxValue - The value in pixels
 * @returns The equivalent value as a string ending in `rem` (e.g. `'1.5rem'`)
 * @internal
 * @see {@link getRootFontSize}
 */
export function toRem(pxValue: number) {
  return String(pxValue / Number(getRootFontSize())) + 'rem'
}

/**
 * Converts a `rem` value into pixels relative to the document root font size.
 *
 * @param rem - The value in `rem`. Accepts either a number (interpreted as raw `rem`) or a string that may include the `rem` suffix (e.g. `'1.5rem'`).
 * @returns The equivalent value in pixels as a number
 * @internal
 * @see {@link getRootFontSize}
 */
export const remToPx = (rem: string | number) =>
  typeof rem === 'number'
    ? Number(getRootFontSize()) * rem
    : Number(getRootFontSize()) * Number(rem.replace('rem', ''))
