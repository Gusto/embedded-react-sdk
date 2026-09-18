import type React from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ThemeContext } from './useTheme'
import { mergePartnerTheme, type GustoSDKTheme } from './theme'
import { useNonce } from '@/contexts/NonceProvider'
import '@/styles/sdk.scss'

/** @internal */
export interface ThemeProviderProps {
  /** Partial set of theme tokens that override the SDK defaults. */
  theme?: Partial<GustoSDKTheme>
  /**
   * Element to use as the portal container for all SDK overlays (Select, ComboBox,
   * DatePicker, Menu, etc.). Defaults to a themed root element the SDK appends
   * directly to `document.body`, so overlays are never affected by a host page's
   * `position`, `transform`, `filter`, or `contain` on an intervening ancestor.
   *
   * Pass a specific element (e.g. when rendering inside a modal or shadow root)
   * to portal overlays there instead.
   */
  portalContainer?: HTMLElement
  /** Subtree rendered inside the SDK's themed root element. */
  children?: React.ReactNode
}

/** @internal */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: partnerThemeOverrides = {},
  portalContainer,
  children,
}) => {
  const nonce = useNonce()
  const GThemeVariables = useRef<HTMLStyleElement | null>(null)
  const portalContainerRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (portalContainer) {
      portalContainerRef.current = portalContainer
      return
    }

    const defaultPortalRoot = document.createElement('div')
    defaultPortalRoot.className = 'GSDK'
    defaultPortalRoot.setAttribute('data-testid', 'GSDK-portal-root')
    document.body.appendChild(defaultPortalRoot)
    portalContainerRef.current = defaultPortalRoot

    return () => {
      defaultPortalRoot.remove()
    }
  }, [portalContainer])

  const mergedTheme = useMemo(
    () => mergePartnerTheme(partnerThemeOverrides),
    [partnerThemeOverrides],
  )

  const cssContent = useMemo(
    () => `.GSDK{\n${parseThemeToCSS(mergedTheme).join('\n')}\n}`,
    [mergedTheme],
  )

  useEffect(() => {
    if (!GThemeVariables.current) {
      GThemeVariables.current = document.createElement('style')
      GThemeVariables.current.setAttribute('data-testid', 'GSDK')
      if (nonce) GThemeVariables.current.nonce = nonce
      document.head.appendChild(GThemeVariables.current)
    }

    GThemeVariables.current.textContent = cssContent
  }, [cssContent, nonce])

  return (
    <ThemeContext.Provider value={{ container: portalContainerRef }}>
      <article className="GSDK" data-testid="GSDK">
        {children}
      </article>
    </ThemeContext.Provider>
  )
}

/**
 * Recursive flattening of the theme object into css variable format
 */
const parseThemeToCSS = (theme: Partial<GustoSDKTheme>, prefix?: string): string[] => {
  const cssProps: string[] = []
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value === 'object') {
      cssProps.push(...parseThemeToCSS(value, prefix ? prefix + '-' + key : key))
    } else {
      cssProps.push(`--g-${prefix ? prefix + '-' + key : key}: ${value};`)
    }
  }
  return cssProps
}
