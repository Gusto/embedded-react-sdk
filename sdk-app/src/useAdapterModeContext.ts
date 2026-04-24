import { useContext } from 'react'
import { AdapterModeContext } from './AdapterModeContext'
import type { AdapterModeContextValue } from './AdapterModeContext'
import { resolveAdapterComponents } from './design/component-adapters/resolveAdapter'

export function useAdapterModeContext(): AdapterModeContextValue {
  return useContext(AdapterModeContext)
}

export function useAdapterComponents() {
  const { adapter } = useContext(AdapterModeContext)
  return resolveAdapterComponents(adapter)
}
