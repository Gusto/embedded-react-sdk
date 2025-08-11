import { getRootFontSize, toRem } from '@/helpers/rem'

// Colors are for internal use in our theme currently
// We don't export them for partner use or overrides
const baseColors = {
  neutral: {
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

const defaultThemeColors = {
  colorBody: baseColors.neutral[100],
  colorBodyContent: baseColors.neutral[1000],
  colorPrimary: baseColors.neutral[1000],
  colorPrimaryAccent: baseColors.neutral[900],
  colorPrimaryContent: baseColors.neutral[100],
  colorSecondary: baseColors.neutral[100],
  colorSecondaryAccent: baseColors.neutral[400],
  colorSecondaryContent: baseColors.neutral[1000],
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
}

export type GustoSDKThemeColors = Partial<typeof defaultThemeColors>

export const createTheme = (colors: GustoSDKThemeColors = {}) => {
  return {
    // Colors
    ...defaultThemeColors,
    ...colors,
    // Input Colors
    inputBackgroundColor: colors.colorBody,
    inputBorderColor: baseColors.neutral[500],
    inputContentColor: colors.colorBodyContent,
    inputBorderWidth: '1px',
    inputPlaceholderColor: baseColors.neutral[800],
    inputAdornmentColor: baseColors.neutral[800],
    inputDisabledBackgroundColor: baseColors.neutral[300],
    // Field Colors
    inputLabelColor: colors.colorBodyContent,
    inputLabelFontSize: toRem(16),
    inputLabelFontWeight: '500',
    inputDescriptionColor: baseColors.neutral[900],
    inputErrorColor: colors.colorErrorAccent,
    // Radius
    inputRadius: toRem(8),
    buttonRadius: toRem(8),
    badgeRadius: toRem(16),
    // Font
    fontSizeRoot: getRootFontSize(),
    fontFamily: 'Geist',
    fontLineHeight: toRem(24),
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
    // Transitions
    transitionDuration: '200ms',
    // Shadows
    shadowResting: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    shadowTopmost:
      '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
    // Focus
    focusRingColor: colors.colorPrimary,
    focusRingWidth: '2px',
  }
}

export type GustoSDKTheme = Partial<ReturnType<typeof createTheme>>

export const mergePartnerTheme = (partnerTheme: GustoSDKTheme): GustoSDKTheme => {
  const colors = Object.entries(defaultThemeColors).reduce(
    (acc: GustoSDKThemeColors, [key, value]) => {
      acc[key as keyof typeof defaultThemeColors] =
        partnerTheme[key as keyof typeof defaultThemeColors] || value
      return acc
    },
    {},
  )

  const theme = createTheme(colors)

  return {
    ...theme,
    ...partnerTheme,
  }
}
