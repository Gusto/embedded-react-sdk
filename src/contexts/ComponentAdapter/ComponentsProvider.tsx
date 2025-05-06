import type React from 'react'
import { useMemo } from 'react'
import type { ComponentsContextType } from './useComponentContext'
import { ComponentsContext } from './useComponentContext'

interface ComponentsProviderProps {
  children: React.ReactNode
  value: ComponentsContextType | undefined
}

export const ComponentsProvider = ({ children, value }: ComponentsProviderProps) => {
  const contextValue = useMemo(() => {
    return value
  }, [value]) // This is intentional to make the component context immutable

  return (
    <ComponentsContext.Provider value={contextValue ?? null}>{children}</ComponentsContext.Provider>
  )
}
