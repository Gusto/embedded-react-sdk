import '@/styles/sdk.scss'
import { getRootFontSize, toRem } from '@/helpers/rem'

// Colors are for internal use in our theme currently
// We don't export them for partner use or overrides
const colors = {
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

export const gustoSDKTheme = {
  // Colors
  colorBody: colors.neutral[100],
  colorBodyContent: colors.neutral[1000],
  colorPrimary: colors.neutral[1000],
  colorPrimaryAccent: colors.neutral[900],
  colorPrimaryContent: colors.neutral[100],
  colorSecondary: colors.neutral[100],
  colorSecondaryAccent: colors.neutral[300],
  colorSecondaryContent: colors.neutral[1000],
  colorInfo: colors.info[100],
  colorInfoAccent: colors.info[500],
  colorInfoContent: colors.info[800],
  colorWarning: colors.warning[100],
  colorWarningAccent: colors.warning[500],
  colorWarningContent: colors.warning[800],
  colorError: colors.error[100],
  colorErrorAccent: colors.error[500],
  colorErrorContent: colors.error[800],
  colorSuccess: colors.success[100],
  colorSuccessAccent: colors.success[500],
  colorSuccessContent: colors.success[800],
  // Input Colors
  inputBackgroundColor: colors.neutral[100],
  inputBorderColor: colors.neutral[500],
  inputContentColor: colors.neutral[1000],
  inputBorderWidth: '1px',
  inputPlaceholderColor: colors.neutral[800],
  inputAdornmentColor: colors.neutral[800],
  inputDisabledBackgroundColor: colors.neutral[300],
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
  focusRingColor: colors.neutral[1000],
  focusRingWidth: '2px',
}

export type GustoSDKTheme = typeof gustoSDKTheme
