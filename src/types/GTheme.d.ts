type RGB = `rgb(${string})`
type RGBA = `rgba(${string})`
type HEX = `#${string}`
type HSL = `hsl(${string})`
type HSLA = `hsla(${string})`
type VAR = `var(${string})`

export type ThemeColor = RGB | RGBA | HEX | HSL | HSLA | VAR | 'transparent'

export interface GThemeSpacing {
  4: string
  8: string
  12: string
  16: string
  20: string
  24: string
  28: string
  32: string
  radius: string
}
export interface GThemeTypography {
  font: string
  textColor: ThemeColor
  errorTextColor: ThemeColor
  defaultLineHeight: string
  fontSize: {
    small: string
    regular: string
    medium: string
  }
  fontWeight: {
    book: number,
    medium: number,
  }
  disabledTextColor: ThemeColor
  headings: {
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
  },
}
export interface GThemeBadge {
  fontSize: string
  fontWeight: number
  borderWidth: string
  paddingX: string
  paddingY: string
}
export interface GThemeColors {
  primary: {
    10: ThemeColor
    20: ThemeColor
    30: ThemeColor
    40: ThemeColor
    50: ThemeColor
    100: ThemeColor
    200: ThemeColor
    300: ThemeColor
    400: ThemeColor
    500: ThemeColor
    600: ThemeColor
    700: ThemeColor
    800: ThemeColor
    900: ThemeColor
    1000: ThemeColor
  }
  gray: {
    10: ThemeColor
    20: ThemeColor
    30: ThemeColor
    40: ThemeColor
    50: ThemeColor
    100: ThemeColor
    200: ThemeColor
    300: ThemeColor
    400: ThemeColor
    500: ThemeColor
    600: ThemeColor
    700: ThemeColor
    800: ThemeColor
    900: ThemeColor
    1000: ThemeColor
  }
  error: {
    100: ThemeColor
    500: ThemeColor
    800: ThemeColor
  }
  warning: {
    100: ThemeColor
    500: ThemeColor
    800: ThemeColor
  }
  success: {
    100: ThemeColor
    400: ThemeColor
    500: ThemeColor
    800: ThemeColor
  }
}
export interface GThemeFocus {
  color: ThemeColor
  borderWidth: string
}
export interface GThemeShadow {
  200: string
}
export interface GThemeTable {
  paddingX: string
  paddingY: string
  fontSize: string
  headerColor: string
  headerBg: string
  columnWeight: keyof typeof GThemeTypography['fontWeight']
  borderColor: string
  background: string
  highlightBg: string
  highlightFg: string
  textColor: string
}
export interface GThemeInput {
  textColor: ThemeColor
  borderColor: ThemeColor
  padding: string
  labelFontSize: string
  labelColor: ThemeColor
  labelFontWeight: number
}
export interface GThemeLink {
  color: ThemeColor
  decoration: string
  hoverColor: ThemeColor
  hoverDecoration: string
  pressedColor: string
}
type GThemeButtonVariant = {
  color: ThemeColor
  bg: ThemeColor
  borderColor: ThemeColor
  hoverBg: ThemeColor
  hoverColor: ThemeColor
  disabledBg: ThemeColor
  focusColor: ThemeColor
}
export interface GThemeButton {
  fontSize: string
  fontWeight: number
  borderWidth: string
  paddingX: string
  paddingY: string
  shadow: string
  primary: GThemeButtonVariant
  secondary: GThemeButtonVariant
  tertiary: GThemeButtonVariant
}

export interface GThemeRadio {
  borderColor: ThemeColor
  hoveredBorderColor: ThemeColor
  pressedBorderColor: ThemeColor
  selectedBorderColor: ThemeColor
  disabledBorderColor: ThemeColor
  disabledLabelColor: ThemeColor
  labelColor: ThemeColor
  focusRingColor: ThemeColor
  errorBorderColor: ThemeColor
  errorLabelColor: ThemeColor
  borderWidth: string
}
export interface GThemeCheckbox {
  borderColor: ThemeColor
  borderWidth: string
}

export interface GTheme {
  rootFS: string
  colors: GThemeColors
  focus: GThemeFocus
  shadow: GThemeShadow
  spacing: GThemeSpacing
  typography: GThemeTypography
  input: GThemeInput
  button: GThemeButton
  radio: GThemeRadio
  checkbox: GThemeCheckbox
  table: GThemeTable
  link: GThemeLink
  badge: GThemeBadge
  optionalLabel: string //This is a string pulled from translations to indicate (optional) on form elements
}
