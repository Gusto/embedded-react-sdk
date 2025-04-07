import type React from 'react'
import { createContext, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createTheme } from './createTheme'
import type { GTheme } from '@/types/GTheme'
import '@/styles/sdk.scss'
import type { DeepPartial } from '@/types/Helpers'

export interface ThemeProviderProps {
  theme?: DeepPartial<GTheme>
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
     * Merging partner overrides into default theme and injecting flattened css variables into document(scoped to .GSDK)
     */
    const theme = {
      ...createTheme(partnerTheme),
      /**
       * Adding a string from translations for indicating optional form elements with CSS
       */
      optionalLabel: partnerTheme.optionalLabel ?? `'${t('optionalLabel')}'`,
    }

    if (GThemeVariables.current) {
      GThemeVariables.current.remove()
    }
    GThemeVariables.current = document.createElement('style')
    GThemeVariables.current.setAttribute('data-testid', 'GSDK')
    GThemeVariables.current.appendChild(
      document.createTextNode(`.GSDK{\n${parseThemeToCSS(theme).join('\n')}\n}`),
    )
    document.head.appendChild(GThemeVariables.current)
  }, [partnerTheme, t])

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
