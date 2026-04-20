import { BREAKPOINTS, BREAKPOINTS_VALUES } from '@/shared/constants'
import { remToPx } from '@/helpers/rem'

const PHONE_WIDTH = 375

export const SWITCHER_OPTIONS = [
  { label: 'Phone', key: 'phone' as const, width: PHONE_WIDTH },
  { label: 'Small', key: BREAKPOINTS.SMALL, width: null },
  { label: 'Medium', key: BREAKPOINTS.MEDIUM, width: null },
  { label: 'Large', key: BREAKPOINTS.LARGE, width: null },
  { label: 'Full', key: null, width: null },
] as const

export type BreakpointOption = (typeof SWITCHER_OPTIONS)[number]['key']

export function getWidthLabel(key: BreakpointOption) {
  if (!key) return '\u221E'
  if (key === 'phone') return `${PHONE_WIDTH}px`
  return `${remToPx(BREAKPOINTS_VALUES[key])}px`
}

export function breakpointToMaxWidth(key: BreakpointOption): number | undefined {
  if (!key) return undefined
  if (key === 'phone') return PHONE_WIDTH
  return remToPx(BREAKPOINTS_VALUES[key])
}
