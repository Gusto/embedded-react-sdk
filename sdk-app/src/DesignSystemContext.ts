import { createContext, useContext, useState } from 'react'

export type DesignSystem = 'default' | 'material' | 'polaris'

export interface DesignSystemContextValue {
  designSystem: DesignSystem
  setDesignSystem: (system: DesignSystem) => void
}

export const DesignSystemContext = createContext<DesignSystemContextValue>({
  designSystem: 'default',
  setDesignSystem: () => {},
})

export const useDesignSystem = () => useContext(DesignSystemContext)

export function useDesignSystemState(): DesignSystemContextValue {
  const [designSystem, setDesignSystem] = useState<DesignSystem>('default')
  return { designSystem, setDesignSystem }
}
