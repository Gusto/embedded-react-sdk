import type React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createTheme } from './createTheme'
import { ThemeContext } from './useTheme'
import type { GTheme } from '@/types/GTheme'
import '@/styles/sdk.scss'
import type { DeepPartial } from '@/types/Helpers'
import { getRootFontSize, toRem } from '@/helpers/rem'

export interface ThemeProviderProps {
  theme?: DeepPartial<GTheme>
  children?: React.ReactNode
}

const colors = {
  gray: {
    100: '#FFFFFF',
    200: '#FBFAFA',
    300: '#F4F4F3',
    400: '#EAEAEA',
    500: '#DCDCDC',
    600: '#BABABC',
    700: '#919197',
    800: '#6C6C72',
    900: '#525257',
    1000: '#1C1C1C',
  },
  error: {
    100: '#FFF7F5',
    500: '#D5351F',
    800: '#B41D08',
  },
  warning: {
    100: '#FFFAF2',
    500: '#E9B550',
    700: '#B88023',
    800: '#B88023',
  },
  success: {
    100: '#F3FAFB',
    400: '#2BABAD',
    500: '#0A8080',
    800: '#005961',
  },
  info: {
    100: '#F3FAFB',
    400: '#2BABAD',
    500: '#0A8080',
    800: '#005961',
  },
  orange: {
    800: '#CA464A',
  },
}

const defaultTheme = {
  // Colors
  colorBody: colors.gray[100],
  colorBodyContent: colors.gray[1000],
  colorPrimary: colors.gray[1000],
  colorPrimaryContent: colors.gray[100],
  colorSecondary: colors.gray[100],
  colorSecondaryContent: colors.gray[1000],
  colorInfo: colors.info[800],
  colorInfoContent: colors.info[100],
  colorWarning: colors.warning[800],
  colorWarningContent: colors.warning[100],
  colorError: colors.error[800],
  colorErrorContent: colors.error[100],
  colorSuccess: colors.success[800],
  colorSuccessContent: colors.success[100],
  // Radius
  radius: '6px',
  // Font
  fontSizeRoot: getRootFontSize(),
  fontFamily: 'Geist',
  fontLineHeight: '1.5rem',
  fontSizeSmall: toRem(14),
  fontSizeRegular: toRem(16),
  fontSizeMedium: toRem(18),
  fontSizeHeading1: toRem(32),
  fontSizeHeading2: toRem(24),
  fontSizeHeading3: toRem(20),
  fontSizeHeading4: toRem(18),
  fontSizeHeading5: toRem(16),
  fontSizeHeading6: toRem(14),
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',
  // Transitions
  transitionDuration: '200ms',
  // Shadows
  shadowResting: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
  shadowTopmost: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
  // Focus
  focusRingColor: colors.gray[1000],
  focusRingWidth: '2px',
}

type NewTheme = typeof defaultTheme

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
