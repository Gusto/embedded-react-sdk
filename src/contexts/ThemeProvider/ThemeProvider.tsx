import type React from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { ThemeContext } from './useTheme'
import { mergePartnerTheme, type GustoSDKTheme } from './theme'
import '@/styles/sdk.scss'

export interface ThemeProviderProps {
  theme?: GustoSDKTheme
  children?: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: partnerThemeOverrides = {},
  children,
}) => {
  const GThemeVariables = useRef<HTMLStyleElement | null>(null)
  const containerRef = useRef<HTMLElement>(null)

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
    // @ts-expect-error HACK fix mismatch where containerRef allows null
    <ThemeContext.Provider value={{ container: containerRef }}>
      <article className="GSDK" data-testid="GSDK" ref={containerRef}>
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
