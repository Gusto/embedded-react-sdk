import type React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ThemeContext } from './useTheme'
import { mergePartnerTheme, type GustoSDKTheme } from './theme'
import '@/styles/sdk.scss'

export interface ThemeProviderProps {
  theme?: GustoSDKTheme
  /**
   * Element to use as the portal container for all SDK overlays (Select, ComboBox,
   * DatePicker, Menu, etc.). Defaults to the SDK's root article element.
   *
   * Pass `document.body` (or another stable element outside the SDK's container)
   * when your app's scroll or clipping context interferes with overlay positioning.
   */
  portalContainer?: HTMLElement
  children?: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: partnerThemeOverrides = {},
  portalContainer,
  children,
}) => {
  const GThemeVariables = useRef<HTMLStyleElement | null>(null)
  const portalContainerRef = useRef<HTMLElement | null>(null)

  const articleRef = useCallback(
    (el: HTMLElement | null) => {
      portalContainerRef.current = portalContainer ?? el
    },
    [portalContainer],
  )

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
      document.head.appendChild(GThemeVariables.current)
    }

    GThemeVariables.current.textContent = cssContent
  }, [cssContent])

  return (
    <ThemeContext.Provider value={{ container: portalContainerRef }}>
      <article className="GSDK" data-testid="GSDK" ref={articleRef}>
        {children}
      </article>
    </ThemeContext.Provider>
  )
}

/**
 * Recursive flattening of the theme object into css variable format
 */
const parseThemeToCSS = (theme: GustoSDKTheme, prefix?: string): string[] => {
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
