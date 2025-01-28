import merge from 'deepmerge'
import { GTheme, GThemeColors, GThemeSpacing, GThemeRadius, GThemeTypography } from '@/types/GTheme'
import { DeepPartial } from '@/types/Helpers'
import { toRem, getRootFontSize } from '@/helpers/rem'

/**
 * NOTE: This is not final shape of the theme object - this will be established when we have designs
 */

const defaultColors: GThemeColors = {
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
}

const defaultSpacing: GThemeSpacing = {
  4: toRem(4),
  8: toRem(8),
  12: toRem(12),
  16: toRem(16),
  20: toRem(20),
  24: toRem(24),
  28: toRem(28),
  32: toRem(32),
  36: toRem(36),
  40: toRem(40),
}

const defaultRadius = '4px'

const createTypographyTheme = ({
  colors = defaultColors,
}: {
  colors?: GThemeColors
}): GThemeTypography => ({
  font: 'GCentra',
  fontSize: {
    small: toRem(14),
    regular: toRem(16),
    medium: toRem(18),
  },
  fontWeight: {
    book: 400,
    medium: 500,
  },
  textColor: colors.gray[1000],
  disabledTextColor: colors.gray[600],
  datePickerErrorTextColor: colors.gray[100],
  defaultLineHeight: '1.5rem',
  headings: {
    1: toRem(32),
    2: toRem(24),
    3: toRem(20),
    4: toRem(18),
    5: toRem(16),
    6: toRem(14),
  },
})

type ComponentThemes = Omit<
  GTheme,
  'colors' | 'spacing' | 'typography' | 'radius' | 'rootFS' | 'optionalLabel'
>

const createComponentThemes = ({
  colors = defaultColors,
  typography = createTypographyTheme({ colors }),
  spacing = defaultSpacing,
  radius = defaultRadius,
}: {
  colors?: GThemeColors
  typography?: GThemeTypography
  spacing?: GThemeSpacing
  radius?: GThemeRadius
}): ComponentThemes => ({
  focus: {
    color: colors.gray[1000],
    borderWidth: '2px',
  },
  shadow: {
    100: '0px 1px 2px 0px rgba(0, 0, 0, 0.10)',
    200: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
  },
  badge: {
    fontSize: toRem(12),
    fontWeight: typography.fontWeight.medium,
    borderWidth: '1px',
    borderRadius: toRem(16),
    paddingX: toRem(8),
    paddingY: toRem(4),
    success: {
      color: colors.gray[1000],
      backgroundColor: colors.success[100],
      borderColor: colors.success[500],
    },
  },
  button: {
    fontSize: toRem(16),
    fontWeight: typography.fontWeight.medium,
    borderWidth: '1px',
    borderRadius: radius,
    textStyle: 'none',
    paddingX: toRem(24),
    paddingY: toRem(12),
    primary: {
      color: colors.gray[100],
      bg: colors.gray[1000],
      borderColor: colors.gray[1000],
      hoverBg: colors.gray[900],
      hoverColor: colors.gray[100],
      disabledBg: colors.gray[700],
      focusColor: colors.gray[1000],
    },
    secondary: {
      color: colors.gray[1000],
      bg: colors.gray[100],
      borderColor: colors.gray[600],
      hoverBg: colors.gray[200],
      hoverColor: colors.gray[900],
      disabledBg: colors.gray[100],
      focusColor: colors.gray[900],
    },
    tertiary: {
      color: colors.gray[1000],
      bg: 'transparent',
      borderColor: 'transparent',
      hoverBg: colors.gray[200],
      hoverColor: colors.gray[900],
      disabledBg: colors.gray[100],
      focusColor: colors.gray[900],
    },
    shadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  input: {
    fontSize: toRem(16),
    textColor: colors.gray[1000],
    borderWidth: '1px',
    borderColor: colors.gray[700],
    background: colors.gray[100],
    disabled: {
      color: colors.gray[800],
      border: colors.gray[500],
      bg: colors.gray[300],
    },
    hovered: {
      borderColor: colors.gray[1000],
    },
    placeholderColor: colors.gray[800],
    padding: toRem(12),
    descriptionColor: colors.gray[900],
    disabledColor: colors.gray[600],
    labelFontSize: toRem(15),
    labelColor: colors.gray[1000],
    labelFontWeight: typography.fontWeight.medium,
  },
  link: {
    color: colors.gray[1000],
    decoration: 'underline',
    hoverColor: colors.gray[900],
    hoverDecoration: 'underline',
    pressedColor: colors.gray[1000],
  },
  checkbox: {
    borderColor: colors.gray[700],
    borderWidth: '1px',
  },
  radio: {
    borderColor: colors.gray[700],
    hoveredBorderColor: colors.gray[800],
    pressedBorderColor: colors.gray[1000],
    selectedBorderColor: colors.gray[1000],
    disabledBorderColor: colors.gray[600],
    disabledLabelColor: colors.gray[600],
    labelColor: colors.gray[1000],
    focusRingColor: colors.gray[700],
    errorBorderColor: colors.error[500],
    errorLabelColor: colors.error[800],
    borderWidth: '1px',
  },
  table: {
    paddingX: toRem(16),
    paddingY: toRem(20),
    fontSize: toRem(16),
    textColor: colors.gray[900],
    borderColor: colors.gray[700],
    background: colors.gray[100],
    headerColor: colors.gray[800],
    headerBg: colors.gray[200],
    highlightBg: colors.gray[200],
    highlightFg: colors.gray[800],
    columnWeight: typography.fontWeight.medium,
  },
})

//Note: when specifying rem values, we will need to be using getRootFontSize for proper conversion
export const createTheme = (overrides: DeepPartial<GTheme> = {}) => {
  const {
    colors: partnerColors = {},
    spacing: partnerSpacing = {},
    typography: partnerTypography = {},
    radius: partnerRadius,
    rootFS: partnerRootFS,
    optionalLabel: partnerOptionalLabel,
    ...partnerTheme
  } = overrides

  const colors = merge<GThemeColors, DeepPartial<GThemeColors>>(defaultColors, partnerColors)
  const spacing = merge<GThemeSpacing, DeepPartial<GThemeSpacing>>(defaultSpacing, partnerSpacing)
  const typography = merge<GThemeTypography, DeepPartial<GThemeTypography>>(
    createTypographyTheme({ colors }),
    partnerTypography,
  )
  const radius = partnerRadius ?? defaultRadius

  const componentThemes = merge<ComponentThemes, DeepPartial<ComponentThemes>>(
    createComponentThemes({ colors, typography, spacing, radius }),
    partnerTheme,
  )

  return {
    spacing,
    typography,
    colors,
    radius,
    rootFS: partnerRootFS ?? getRootFontSize(),
    optionalLabel: partnerOptionalLabel ?? ' (optional)',
    ...componentThemes,
  } satisfies GTheme
}
