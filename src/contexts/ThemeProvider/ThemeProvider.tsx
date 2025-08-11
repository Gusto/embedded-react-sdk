import type React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const gustoSDKThemeWithOverrides = mergePartnerTheme(partnerThemeOverrides)

    if (GThemeVariables.current) {
      GThemeVariables.current.remove()
    }
    GThemeVariables.current = document.createElement('style')
    GThemeVariables.current.setAttribute('data-testid', 'GSDK')
    GThemeVariables.current.appendChild(
      document.createTextNode(
        `.GSDK{\n${parseThemeToCSS(gustoSDKThemeWithOverrides).join('\n')}\n}`,
      ),
    )
    document.head.appendChild(GThemeVariables.current)
  }, [partnerThemeOverrides, t])

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
      cssProps.push(`--g-${prefix ? prefix + '-' + key : key}: ${String(value)};`)
    }
  }
  return cssProps
}
