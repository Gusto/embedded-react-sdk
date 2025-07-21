import type React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createTheme } from './createTheme'
import { ThemeContext } from './useTheme'
import { gustoSDKTheme, type GustoSDKTheme } from './theme'
import type { GTheme } from '@/types/GTheme'
import '@/styles/sdk.scss'
import type { DeepPartial } from '@/types/Helpers'

// Create a union type that allows both the existing GTheme structure and the new flat structure
type EnhancedTheme = DeepPartial<GTheme> & Partial<GustoSDKTheme>

export interface ThemeProviderProps {
  theme?: EnhancedTheme
  children?: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: partnerTheme = {},
  children,
}) => {
  const GThemeVariables = useRef<HTMLStyleElement | null>(null)
  const { t } = useTranslation()
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Temporarily supports the legacy theme while we migrate to the new theme. Pulls out the
    // legacy theme entries and merges them with the partner overrides. Once the theming migration
    // is complete, we can remove the legacy theme entries and only support the new theme.
    const {
      colors,
      spacing,
      typography,
      radius,
      transitionDuration,
      rootFS,
      focus,
      shadow,
      input,
      button,
      radio,
      checkbox,
      table,
      calendarPreview,
      card,
      link,
      badge,
      ...gustoSDKPartnerTheme
    } = partnerTheme

    const legacyPartnerTheme = {
      ...(colors ? { colors } : {}),
      ...(spacing ? { spacing } : {}),
      ...(typography ? { typography } : {}),
      ...(radius ? { radius } : {}),
      ...(transitionDuration ? { transitionDuration } : {}),
      ...(rootFS ? { rootFS } : {}),
      ...(focus ? { focus } : {}),
      ...(shadow ? { shadow } : {}),
      ...(input ? { input } : {}),
      ...(button ? { button } : {}),
      ...(radio ? { radio } : {}),
      ...(checkbox ? { checkbox } : {}),
      ...(table ? { table } : {}),
      ...(calendarPreview ? { calendarPreview } : {}),
      ...(card ? { card } : {}),
      ...(link ? { link } : {}),
      ...(badge ? { badge } : {}),
    }

    const legacyTheme = createTheme(legacyPartnerTheme)

    const gustoSDKThemeWithOverrides = {
      ...gustoSDKTheme,
      ...gustoSDKPartnerTheme,
    }

    const theme = {
      ...legacyTheme,
      ...gustoSDKThemeWithOverrides,
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
