import { toRem } from '@/helpers/rem'
import { BREAKPOINTS } from '@/shared/constants'
import type { GThemeSpacing } from '@/types/GTheme'

type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

export type Responsive<T> =
  | T
  | Partial<{
      [K in BreakpointKey]: T
    }>

export type CustomPropertyValue = string | number

export type ResponsiveSpacing = Responsive<keyof GThemeSpacing | 0>

export function isResponsiveValue(value: Responsive<CustomPropertyValue | CustomPropertyValue[]>) {
  return Object.values(BREAKPOINTS).some(
    breakpoint => typeof value === 'object' && breakpoint in value,
  )
}

export function transformResponsiveValue(
  value: Responsive<CustomPropertyValue | CustomPropertyValue[]>,
  transformValue: (value: CustomPropertyValue | CustomPropertyValue[]) => string,
) {
  const responsiveValue = isResponsiveValue(value) ? value : { base: value }

  const transformedResponsiveValue: Record<string, string> = {}

  Object.entries(responsiveValue).forEach(([key, value]) => {
    transformedResponsiveValue[key] = transformValue(value)
  })

  return transformedResponsiveValue
}

export function transformResponsiveSpacingValue(responsiveValue: ResponsiveSpacing) {
  return transformResponsiveValue(responsiveValue, value =>
    value === 0 ? '0' : `var(--g-spacing-${value})`,
  )
}

export const toRemIfNumeric = (value: string | number) => {
  return typeof value === 'number' ? toRem(value) : value
}

export function createResponsiveCustomProperties(
  property: string,
  value?: Responsive<CustomPropertyValue | CustomPropertyValue[]>,
) {
  if (!value) return {}

  const responsiveValues = isResponsiveValue(value) ? value : { base: value }
  const properties: Record<string, string> = {}

  Object.entries(responsiveValues).forEach(([key, customPropertyValue]) => {
    const customPropertyValueResult = Array.isArray(customPropertyValue)
      ? customPropertyValue.map(toRemIfNumeric).join(' ')
      : toRemIfNumeric(customPropertyValue)

    properties[`--g-${property}-${key}`] = customPropertyValueResult
  })

  return properties
}

export function setResponsiveCustomProperties(
  properties?: Record<string, Responsive<CustomPropertyValue | CustomPropertyValue[]> | undefined>,
) {
  const allProperties: Record<string, string> = {}

  if (!properties) return allProperties

  Object.entries(properties).forEach(([property, value]) => {
    Object.assign(allProperties, createResponsiveCustomProperties(property, value))
  })

  return allProperties
}
