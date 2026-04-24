import { createContext } from 'react'
import type { AdapterOption } from './design/component-adapters/types'

export interface AdapterModeContextValue {
  adapter: AdapterOption
  setAdapter: (adapter: AdapterOption) => void
}

export const AdapterModeContext = createContext<AdapterModeContextValue>({
  adapter: 'default',
  setAdapter: () => {},
})

export const AdapterModeProvider = AdapterModeContext.Provider
