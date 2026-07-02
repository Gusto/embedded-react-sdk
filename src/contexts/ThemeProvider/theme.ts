import type { GustoSDKTheme, GustoSDKThemeColors } from './types'
import { getRootFontSize, toRem } from '@/helpers/rem'

export type { GustoSDKTheme, GustoSDKThemeColors }

// Colors are for internal use in our theme currently
// We don't export them for partner use or overrides
const baseColors = {
  neutral: {
    25: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E9EAEB',
    300: '#D5D7DA',
    400: '#A4A7AE',
    500: '#717680',
    600: '#535862',
    700: '#414651',
    800: '#252B37',
    900: '#181D27',
    1000: '#0A0D12',
  },
  error: {
    100: '#FEF3F2',
    500: '#C5271C',
    800: '#D92D20',
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
    100: '#F4F4F3',
    500: '#DCDCDC',
    800: '#1C1C1C',
  },
}

/** @internal */
export const transitionDuration = 200

const defaultThemeColors: GustoSDKThemeColors = {
  colorBody: baseColors.neutral[25],
  colorBodyAccent: baseColors.neutral[100],
  colorBodyContent: baseColors.neutral[1000],
  colorBodySubContent: baseColors.neutral[700],
  colorPrimary: baseColors.neutral[1000],
  colorPrimaryAccent: baseColors.neutral[900],
  colorPrimaryContent: baseColors.neutral[100],
  colorSecondary: baseColors.neutral[25],
  colorSecondaryAccent: baseColors.neutral[100],
  colorSecondaryContent: baseColors.neutral[600],
  colorInfo: baseColors.info[100],
  colorInfoAccent: baseColors.info[500],
  colorInfoContent: baseColors.info[800],
  colorWarning: baseColors.warning[100],
  colorWarningAccent: baseColors.warning[500],
  colorWarningContent: baseColors.warning[800],
  colorError: baseColors.error[100],
  colorErrorAccent: baseColors.error[500],
  colorErrorContent: baseColors.error[800],
  colorSuccess: baseColors.success[100],
  colorSuccessAccent: baseColors.success[500],
  colorSuccessContent: baseColors.success[800],
  colorBorderPrimary: baseColors.neutral[300],
  colorBorderSecondary: baseColors.neutral[200],
  colorButtonIcon: baseColors.neutral[400],
}

/** @internal */
export const createTheme = (colors: Partial<GustoSDKThemeColors> = {}): GustoSDKTheme => {
  const mergedColors = { ...defaultThemeColors, ...colors }

  return {
    ...mergedColors,
    inputBackgroundColor: mergedColors.colorBody,
    inputBorderColor: baseColors.neutral[300],
    inputContentColor: mergedColors.colorBodyContent,
    inputBorderWidth: '1px',
    inputPlaceholderColor: mergedColors.colorBodySubContent,
    inputAdornmentColor: mergedColors.colorBodySubContent,
    inputDisabledBackgroundColor: mergedColors.colorBodyAccent,
    inputLabelColor: mergedColors.colorBodyContent,
    inputLabelFontSize: toRem(16),
    inputLabelFontWeight: '500',
    inputDescriptionColor: mergedColors.colorBodySubContent,
    inputErrorColor: mergedColors.colorErrorAccent,
    inputRadius: toRem(8),
    buttonRadius: toRem(8),
    cardRadius: toRem(8),
    badgeRadius: toRem(999),
    bannerRadius: toRem(8),
    boxRadius: toRem(8),
    fontSizeRoot: getRootFontSize(),
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontLineHeightLarge: toRem(28),
    fontLineHeightRegular: toRem(24),
    fontLineHeightSmall: toRem(20),
    fontLineHeightExtraSmall: toRem(18),
    fontSizeExtraSmall: toRem(12),
    fontSizeSmall: toRem(14),
    fontSizeRegular: toRem(16),
    fontSizeLarge: toRem(18),
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
    transitionDuration: `${transitionDuration}ms`,
    shadowResting: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    shadowTopmost:
      '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
    focusRingColor: mergedColors.colorPrimary,
    focusRingWidth: '2px',
  }
}

/** @internal */
export const mergePartnerTheme = (partnerTheme: Partial<GustoSDKTheme>): GustoSDKTheme => {
  const colors = Object.entries(defaultThemeColors).reduce(
    (acc, [key, value]) => {
      acc[key as keyof GustoSDKThemeColors] =
        partnerTheme[key as keyof GustoSDKThemeColors] || value
      return acc
    },
    { ...defaultThemeColors },
  )

  return {
    ...createTheme(colors),
    ...partnerTheme,
  }
}
