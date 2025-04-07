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
  36: string
  40: string
}

export type GThemeRadius = string

export type GThemeTransitionDuration = string

export interface GThemeTypography {
  font: string
  textColor: ThemeColor
  datePickerErrorTextColor: ThemeColor
  defaultLineHeight: string
  fontSize: {
    small: string
    regular: string
    medium: string
  }
  fontWeight: {
    regular: number
    medium: number
  }
  disabledTextColor: ThemeColor
  headings: {
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
  }
}
export interface GThemeBadge {
  success: {
    color: string
    backgroundColor: string
    borderColor: string
  }
  fontSize: string
  fontWeight: number
  borderWidth: string
  borderRadius: string
  paddingX: string
  paddingY: string
}

export interface GThemeCalendarDisplay {
  primaryHighlight: string
  warningHighlight: string
  lightFont: string
  darkFont: string
  borderColor: string
}

export interface GThemeCard {
  borderColor: string
  dividerColor: string
  headerTextColor: string
  contentTextColor: string
  columnTitleColor: string
  columnTitleFontSize: string
}

export interface GThemeColors {
  gray: {
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
    700: ThemeColor
    800: ThemeColor
  }
  success: {
    100: ThemeColor
    400: ThemeColor
    500: ThemeColor
    800: ThemeColor
  }
  orange: {
    800: ThemeColor
  }
}
export interface GThemeFocus {
  color: ThemeColor
  borderWidth: string
}
export interface GThemeShadow {
  100: string
  200: string
}
export interface GThemeTable {
  paddingX: string
  paddingY: string
  fontSize: string
  headerColor: string
  headerBg: string
  columnWeight: number
  borderColor: string
  background: string
  highlightBg: string
  highlightFg: string
  textColor: string
}
export interface GThemeInput {
  fontSize: string
  textColor: ThemeColor
  borderColor: ThemeColor
  borderWidth: string
  background: string
  paddingX: string
  paddingY: string
  height: string
  labelFontSize: string
  labelColor: ThemeColor
  labelFontWeight: number
  disabled: {
    color: ThemeColor
    border: ThemeColor
    bg: ThemeColor
  }
  hovered: {
    borderColor: ThemeColor
  }
  placeholderColor: ThemeColor
  descriptionColor: ThemeColor
  disabledColor: ThemeColor
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
  borderRadius: string
  textStyle: 'uppercase' | 'none' | 'capitalize' | 'lowercase'
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
  selectedColor: ThemeColor
  checkmarkColor: ThemeColor
  radius: GThemeRadius
  transitionDuration: GThemeTransitionDuration
  hover: {
    uncheckedBackground: ThemeColor
    uncheckedBorderColor: ThemeColor
    checkedBackground: ThemeColor
    checkedBorderColor: ThemeColor
  }
  disabled: {
    borderColor: ThemeColor
    background: ThemeColor
    checkmarkColor: ThemeColor
  }
}

export interface GTheme {
  rootFS: string
  colors: GThemeColors
  focus: GThemeFocus
  shadow: GThemeShadow
  spacing: GThemeSpacing
  radius: GThemeRadius
  transitionDuration: GThemeTransitionDuration
  typography: GThemeTypography
  input: GThemeInput
  button: GThemeButton
  radio: GThemeRadio
  checkbox: GThemeCheckbox
  table: GThemeTable
  calendarDisplay: GThemeCalendarDisplay
  card: GThemeCard
  link: GThemeLink
  badge: GThemeBadge
  optionalLabel: string //This is a string pulled from translations to indicate (optional) on form elements
}
