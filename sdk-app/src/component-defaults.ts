/**
 * Per-component default props for the SDK Dev App.
 *
 * These are runtime defaults that make components renderable in the demo
 * environment without requiring manual prop input via the Settings panel.
 * Keys match the `Category.ComponentName` format used in the registry.
 *
 * Values can be static or use factory functions (evaluated at render time).
 */

import { STORAGE_KEY as ENTITY_IDS_STORAGE_KEY } from './useEntities'

type PropValue = string | number | boolean | string[] | null
type PropValueOrFactory = PropValue | (() => PropValue)

/** Reads the contractor ID already configured in the Settings panel, so fixtures needing a contractor don't need a second, disconnected ID hardcoded here. */
function currentContractorIds(): string[] {
  try {
    const stored = localStorage.getItem(ENTITY_IDS_STORAGE_KEY)
    const contractorId = stored ? (JSON.parse(stored).contractorId as string | undefined) : ''
    return contractorId ? [contractorId] : []
  } catch {
    return []
  }
}

export const DEFAULT_COMPONENT_PROPS: Record<string, Record<string, PropValueOrFactory>> = {
  'EmployeeOnboarding.Profile': {
    isAdmin: true,
  },
  'EmployeeOnboarding.Compensation': {
    startDate: '2020-01-01',
  },
  'EmployeeOnboarding.DocumentSigner': {
    withEmployeeI9: true,
  },
  'EmployeeOnboarding.StateTaxes': {
    isAdmin: true,
  },
  'ContractorManagement.HistoricalPaymentAmounts': {
    contractorIds: currentContractorIds,
    checkDate: '2025-06-15',
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
