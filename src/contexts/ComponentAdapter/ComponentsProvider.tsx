import type React from 'react'
import { useMemo } from 'react'
import type { ComponentsContextType } from './useComponentContext'
import { ComponentsContext, useComponentContext } from './useComponentContext'

// Re-export the hook
export { useComponentContext }

interface ComponentsProviderProps {
  children: React.ReactNode
  value: ComponentsContextType
}

export const ComponentsProvider = ({ children, value }: ComponentsProviderProps) => {
  const contextValue = useMemo(() => {
    return value
  }, [value]) // This is intentional to make the component context immutable

  return <ComponentsContext.Provider value={contextValue}>{children}</ComponentsContext.Provider>
}
