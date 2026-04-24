import type { AdapterOption } from './types'
import { gwsComponentOverrides } from './gws'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'

export function resolveAdapterComponents(
  adapter: AdapterOption,
): Partial<ComponentsContextType> | undefined {
  switch (adapter) {
    case 'gws':
      return gwsComponentOverrides
    case 'default':
    default:
      return undefined
  }
}
