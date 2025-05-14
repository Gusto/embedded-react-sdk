import merge from 'deepmerge'
import type {
  GTheme,
  GThemeColors,
  GThemeSpacing,
  GThemeRadius,
  GThemeTypography,
  GThemeTransitionDuration,
} from '@/types/GTheme'
import type { DeepPartial } from '@/types/Helpers'
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
  orange: {
    800: '#CA464A',
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

const defaultRadius = '6px'
const defaultTransitionDuration = '200ms'

const createTypographyTheme = ({
  colors = defaultColors,
}: {
  colors?: GThemeColors
}): GThemeTypography => ({
  font: 'Geist',
  fontSize: {
    small: toRem(14),
    regular: toRem(16),
    medium: toRem(18),
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
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
  'colors' | 'spacing' | 'typography' | 'radius' | 'rootFS' | 'optionalLabel' | 'transitionDuration'
>

const createComponentThemes = ({
  colors = defaultColors,
  typography = createTypographyTheme({ colors }),
  spacing = defaultSpacing,
  radius = defaultRadius,
  transitionDuration = defaultTransitionDuration,
}: {
  colors?: GThemeColors
  typography?: GThemeTypography
  spacing?: GThemeSpacing
  radius?: GThemeRadius
  transitionDuration?: GThemeTransitionDuration
}): ComponentThemes => ({
  focus: {
    color: colors.gray[1000],
    borderWidth: '2px',
  },
  shadow: {
    100: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    200: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
  },
  badge: {
    fontSize: toRem(12),
    fontWeight: typography.fontWeight.medium,
    borderWidth: '1px',
    borderRadius: toRem(16),
    paddingX: toRem(10),
    paddingY: toRem(2),
    success: {
      color: colors.success[800],
      backgroundColor: colors.success[100],
      borderColor: colors.success[400],
    },
  },
  button: {
    fontSize: toRem(14),
    fontWeight: typography.fontWeight.medium,
    borderWidth: '1px',
    borderRadius: radius,
    textStyle: 'none',
    paddingX: toRem(16),
    paddingY: toRem(8),
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
      borderColor: colors.gray[500],
      hoverBg: colors.gray[300],
      hoverColor: colors.gray[1000],
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
  calendarPreview: {
    primaryHighlight: colors.gray[1000],
    secondaryHighlight: colors.orange[800],
    lightFont: colors.gray[100],
    darkFont: colors.gray[1000],
    borderColor: colors.gray[600],
  },
  card: {
    borderColor: colors.gray[400],
    dividerColor: colors.gray[400],
    headerTextColor: colors.gray[1000],
    contentTextColor: colors.gray[900],
    columnTitleColor: colors.gray[900],
    columnTitleFontSize: toRem(14),
  },
  input: {
    fontSize: toRem(14),
    radius: toRem(8),
    textColor: colors.gray[1000],
    borderWidth: '1px',
    borderColor: colors.gray[500],
    background: colors.gray[100],
    disabled: {
      color: colors.gray[700],
      border: colors.gray[500],
      bg: colors.gray[200],
    },
    hovered: {
      borderColor: colors.gray[1000],
    },
    error: {
      borderColor: colors.error[500],
    },
    placeholderColor: colors.gray[800],
    height: toRem(40),
    paddingX: toRem(12),
    paddingY: toRem(8),
    descriptionColor: colors.gray[900],
    disabledColor: colors.gray[600],
    labelFontSize: toRem(15),
    labelColor: colors.gray[1000],
    labelFontWeight: typography.fontWeight.medium,
    adornmentFontSize: toRem(16),
    adornmentColor: colors.gray[800],
  },
  link: {
    color: colors.gray[1000],
    decoration: 'underline',
    hoverColor: colors.gray[900],
    hoverDecoration: 'underline',
    pressedColor: colors.gray[1000],
    currentColor: colors.gray[800],
  },
  checkbox: {
    borderColor: colors.gray[700],
    borderWidth: '1px',
    selectedColor: colors.gray[1000],
    checkmarkColor: colors.gray[100],
    radius,
    transitionDuration,
    hover: {
      uncheckedBackground: colors.gray[300],
      uncheckedBorderColor: colors.gray[900],
      checkedBackground: colors.gray[900],
      checkedBorderColor: colors.gray[900],
    },
    disabled: {
      borderColor: colors.gray[500],
      background: colors.gray[300],
      checkmarkColor: typography.disabledTextColor,
    },
  },
  radio: {
    borderColor: colors.gray[700],
    hoveredBorderColor: colors.gray[800],
    pressedBorderColor: colors.gray[1000],
    selectedBorderColor: colors.gray[1000],
    disabledBorderColor: colors.gray[500],
    disabledBackground: colors.gray[300],
    disabledDotColor: typography.disabledTextColor,
    disabledLabelColor: colors.gray[600],
    labelColor: colors.gray[1000],
    focusRingColor: colors.gray[1000],
    errorBorderColor: colors.error[500],
    errorLabelColor: colors.error[800],
    borderWidth: '1px',
    transitionDuration,
  },
  table: {
    paddingX: toRem(16),
    paddingY: toRem(20),
    fontSize: toRem(14),
    textColor: colors.gray[1000],
    borderColor: colors.gray[500],
    background: colors.gray[100],
    headerColor: colors.gray[800],
    headerBg: colors.gray[200],
    highlightBg: colors.gray[200],
    highlightFg: colors.gray[800],
    columnWeight: typography.fontWeight.regular,
  },
})

//Note: when specifying rem values, we will need to be using getRootFontSize for proper conversion
export const createTheme = (overrides: DeepPartial<GTheme> = {}) => {
  const {
    colors: partnerColors = {},
    spacing: partnerSpacing = {},
    typography: partnerTypography = {},
    radius: partnerRadius,
    transitionDuration: partnerTransitionDuration,
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
  const transitionDuration = partnerTransitionDuration ?? defaultTransitionDuration

  const componentThemes = merge<ComponentThemes, DeepPartial<ComponentThemes>>(
    createComponentThemes({ colors, typography, spacing, radius, transitionDuration }),
    partnerTheme,
  )

  return {
    spacing,
    typography,
    colors,
    radius,
    rootFS: partnerRootFS ?? getRootFontSize(),
    optionalLabel: partnerOptionalLabel ?? ' (optional)',
    transitionDuration,
    ...componentThemes,
  } satisfies GTheme
}
