import { toRem } from '@/helpers/rem'
import { BREAKPOINTS } from '@/shared/constants'

type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

/**
 * A value that may be specified as a single value or as a partial map of breakpoints to values.
 *
 * @typeParam T - The underlying value type at each breakpoint.
 * @internal
 */
export type Responsive<T> =
  | T
  | Partial<{
      [K in BreakpointKey]: T
    }>

/**
 * Value accepted for a CSS custom property — either a string token or a numeric pixel value.
 *
 * @internal
 */
export type CustomPropertyValue = string | number

/**
 * Returns true if the value is a breakpoint-keyed object rather than a single value.
 *
 * @param value - The value to inspect.
 * @returns Whether the value is keyed by a known breakpoint.
 * @internal
 */
export function isResponsiveValue(value: Responsive<CustomPropertyValue | CustomPropertyValue[]>) {
  return Object.values(BREAKPOINTS).some(
    breakpoint => typeof value === 'object' && breakpoint in value,
  )
}

/**
 * Applies a transform to every breakpoint entry in a responsive value.
 *
 * Non-responsive values are treated as if specified at the `base` breakpoint.
 *
 * @param value - The responsive value to transform.
 * @param transformValue - Function applied to each per-breakpoint value.
 * @returns A map of breakpoint key to the transformed string value.
 * @internal
 */
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

/**
 * Converts numeric values to rem units and passes string values through unchanged.
 *
 * @param value - A pixel number or a pre-formatted CSS length string.
 * @returns The value as a rem-unit string when numeric, otherwise the original string.
 * @internal
 */
export const toRemIfNumeric = (value: string | number) => {
  return typeof value === 'number' ? toRem(value) : value
}

/**
 * Builds a map of CSS custom properties for one property across breakpoints.
 *
 * Each entry is keyed `--g-<property>-<breakpoint>` and numeric values are converted to rem.
 * Array values are joined with spaces (for shorthand properties like margin).
 *
 * @param property - The base property name used to build custom property keys.
 * @param value - The responsive value, or undefined to produce no properties.
 * @returns A map of custom property names to string values.
 * @internal
 */
export function createResponsiveCustomProperties(
  property: string,
  value?: Responsive<CustomPropertyValue | CustomPropertyValue[]>,
) {
  if (!value && value !== 0) return {}

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

/**
 * Builds a flat map of CSS custom properties for multiple properties at once.
 *
 * Combines the output of {@link createResponsiveCustomProperties} for every entry in the input.
 *
 * @param properties - A map of property name to its responsive value.
 * @returns A flat map of custom property names to string values suitable for a `style` prop.
 * @internal
 */
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
