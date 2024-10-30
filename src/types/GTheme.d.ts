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
  font?: string
  fontBold?: string
  textColor?: ThemeColor
  errorTextColor?: ThemeColor
  defaultLineHeight?: string
}
export interface GThemeColors {
  primary: {
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
  borderColor?: string
  background?: string
  highlightBg?: string
  highlightFg?: string
  focusRingColor?: string
  textColor?: string
}
export interface GThemInput {
  textColor: ThemeColor
  borderColor: ThemeColor
  padding: string
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
}
export interface GThemeCheckbox {
  borderColor: ThemeColor
  borderWidth: string
}

export interface GTheme {
  rootFS: string
  colors?: GThemeColors
  focus?: GThemeFocus
  shadow?: GThemeShadow
  spacing?: GThemeSpacing
  typography?: GThemeTypography
  input: GThemInput
  button: GThemeButton
  radio: GThemeRadio
  checkbox: GThemeCheckbox
  table?: GThemeTable
  link?: GThemeLink
  optionalLabel?: string //This is a string pulled from translations to indicate (optional) on form elements
}
