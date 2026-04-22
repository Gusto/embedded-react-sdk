/**
 * Per-component default props for the SDK Dev App.
 *
 * These are runtime defaults that make components renderable in the demo
 * environment without requiring manual prop input via the Settings panel.
 * Keys match the `Category.ComponentName` format used in the registry.
 *
 * Values can be static or use factory functions (evaluated at render time).
 */

type PropValue = string | number | boolean | null
type PropValueOrFactory = PropValue | (() => PropValue)

export const DEFAULT_COMPONENT_PROPS: Record<string, Record<string, PropValueOrFactory>> = {
  'Employee.Profile': {
    isAdmin: true,
  },
  'Employee.Compensation': {
    startDate: () => new Date().toISOString().slice(0, 10),
  },
  'Hooks.CompensationForm': {
    withStartDateField: true,
  },
  'Hooks.SignEmployeeForm': {
    formId: '',
  },
  'Hooks.SignEmployeeI9Form': {
    formId: '',
  },
}

export function resolveDefaults(key: string): Record<string, PropValue> {
  const defaults = DEFAULT_COMPONENT_PROPS[key]
  if (!defaults) return {}

  return Object.fromEntries(
    Object.entries(defaults).map(([prop, value]) => [
      prop,
      typeof value === 'function' ? value() : value,
    ]),
  )
}
