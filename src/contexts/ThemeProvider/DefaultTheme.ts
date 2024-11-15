import { GTheme } from '@/types/GTheme'

/**
 * Detects font-size on the document root element with fallback to 16px wich is the default browser setting
 * @returns number
 */
function getRootFontSize() {
  const defaultFontSize = '16'

  if (typeof window === 'undefined') {
    return defaultFontSize
  }

  const match = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('font-size')
    .match(/\d+/)
  return typeof match === 'string' ? match : defaultFontSize
}

function toRem(pxValue: number) {
  return String(pxValue / Number(getRootFontSize())) + 'rem'
}
/**
 * NOTE: This is not final shape of the theme object - this will be established when we have designs
 */

const colors = {
  primary: {
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
} as const

const spacing = {
  4: toRem(4),
  8: toRem(8),
  12: toRem(12),
  16: toRem(16),
  20: toRem(20),
  24: toRem(24),
  28: toRem(28),
  32: toRem(32),
  radius: '4px',
} as const

const typography = {
  font: 'GCentra',
  fontSize: {
    regular: toRem(16),
    small: toRem(14),
  },
  textColor: colors.primary[1000],
  disabledTextColor: colors.primary[600],
  errorTextColor: colors.error[500],
  defaultLineHeigh: '1.5rem',
  headings: {
    1: toRem(32),
    2: toRem(24),
    3: toRem(20),
    4: toRem(18),
    5: toRem(16),
    6: toRem(14),
  },
} as const

const focus = {
  color: colors.primary[600],
  borderWidth: '2px',
} as const

const shadow = {
  200: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
} as const

const badge = {
  fontSize: toRem(12),
  fontWeight: 500,
  borderWidth: '1px',
  borderRadius: toRem(16),
  paddingX: toRem(8),
  paddingY: toRem(4),
}
const button = {
  fontSize: toRem(16),
  fontWeight: 500,
  borderWidth: '1px',
  paddingX: toRem(24),
  paddingY: toRem(12),
  primary: {
    color: colors.primary[100],
    bg: colors.primary[1000],
    borderColor: colors.primary[1000],
    hoverBg: colors.primary[900],
    hoverColor: colors.primary[100],
    disabledBg: colors.primary[700],
    focusColor: colors.primary[1000],
  },
  secondary: {
    color: colors.primary[1000],
    bg: colors.primary[100],
    borderColor: colors.primary[600],
    hoverBg: colors.primary[200],
    hoverColor: colors.primary[900],
    disabledBg: colors.primary[100],
    focusColor: colors.primary[900],
    shadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  tertiary: {
    color: colors.primary[1000],
    bg: colors.primary[100],
    borderColor: 'transparent',
    hoverBg: colors.primary[200],
    hoverColor: colors.primary[900],
    disabledBg: colors.primary[100],
    focusColor: colors.primary[900],
  },
  shadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
} as const

const input = {
  fontSize: toRem(16),
  textColor: colors.primary[1000],
  borderWidth: '1px',
  borderColor: colors.primary[700],
  background: colors.primary[100],
  disabled: {
    color: colors.primary[800],
    border: colors.primary[500],
    bg: colors.primary[300],
  },
  placeholderColor: colors.primary[800],
  padding: toRem(12),
  descriptionColor: colors.primary[900],
  disabledColor: colors.primary[600],
  labelFontSize: toRem(15),
  labelColor: colors.primary[1000],
  labelFontWeight: 500,
} as const

const link = {
  color: colors.success[400],
  decoration: 'underline',
  hoverColor: colors.success[500],
  hoverDecoration: 'underline',
  pressedColor: colors.success[800],
} as const

const checkbox = { borderColor: colors.primary[700], borderWidth: '1px' } as const

const radio = {
  borderColor: colors.primary[700],
  hoveredBorderColor: colors.primary[800],
  pressedBorderColor: colors.primary[1000],
  selectedBorderColor: colors.primary[900],
  disabledBorderColor: colors.primary[600],
  disabledLabelColor: colors.primary[600],
  labelColor: colors.primary[1000],
  focusRingColor: colors.primary[700],
  errorBorderColor: colors.error[500],
  errorLabelColor: colors.error[800],
} as const

const table = {
  paddingX: toRem(16),
  paddingY: toRem(20),
  fontSize: toRem(16),
  textColor: colors.primary[900],
  borderColor: colors.primary[700],
  background: colors.primary[100],
  headerColor: colors.primary[800],
  headerBg: colors.primary[200],
  highlightBg: colors.primary[200],
  highlightFg: colors.primary[800],
  columnWeight: 500,
} as const

//Note: when specifying rem values, we will need to be using getRootFontSize for proper conversion
export const defaultTheme = {
  rootFS: getRootFontSize(),
  spacing,
  typography,
  colors,
  focus,
  shadow,
  link,
  input,
  button,
  radio,
  checkbox,
  table,
  badge,
  optionalLabel: ' (optional)', //Fallback -> will be replaced from translations
} satisfies GTheme
