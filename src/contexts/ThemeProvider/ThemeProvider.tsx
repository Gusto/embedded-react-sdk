import merge from 'deepmerge'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GTheme } from '@/types/GTheme'
import { defaultTheme } from './DefaultTheme'
import '@/styles/sdk.scss'

export interface ThemeProviderProps {
  theme?: GTheme
  children?: React.ReactNode
}
export interface ThemeContextProps {
  container: React.RefObject<HTMLElement>
}
export const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps)

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: partnerTheme = {},
  children,
}) => {
  const GThemeVariables = useRef<HTMLStyleElement | null>(null)
  const { t } = useTranslation()
  const containerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    /**
     * Adding a string from translations for indicating optional form elements with CSS
     */

    defaultTheme.optionalLabel = `'${t('optionalLabel')}'`
    /**
     * Merging partner overrides into default theme and injecting flattened css variables into document(scoped to .GSDK)
     */
    const mergedTheme = merge(defaultTheme, partnerTheme)

    if (GThemeVariables.current) {
      GThemeVariables.current.remove()
    }
    GThemeVariables.current = document.createElement('style')
    GThemeVariables.current.setAttribute('data-testid', 'GSDK')
    GThemeVariables.current.appendChild(
      document.createTextNode(`.GSDK{\n${parseThemeToCSS(mergedTheme).join('\n')}\n}`),
    )
    document.head.appendChild(GThemeVariables.current)
  }, [partnerTheme])

  return (
    <ThemeContext.Provider value={{ container: containerRef }}>
      <section className="GSDK" data-testid="GSDK" ref={containerRef}>
        {children}
      </section>
    </ThemeContext.Provider>
  )
}

/**
 * Recursive flattening of the theme object into css variable format
 */
const parseThemeToCSS = (theme: GTheme, prefix?: string): string[] => {
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

export const useTheme = () => useContext(ThemeContext)
