import { toRem } from '@/helpers/rem'
import { BREAKPOINTS } from '@/shared/constants'

type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

export type Responsive<T> =
  | T
  | Partial<{
      [K in BreakpointKey]: T
    }>

export type CustomPropertyValue = string | number

export function isResponsiveValue(value: Responsive<CustomPropertyValue | CustomPropertyValue[]>) {
  return Object.values(BREAKPOINTS).some(
    breakpoint => typeof value === 'object' && breakpoint in value,
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
