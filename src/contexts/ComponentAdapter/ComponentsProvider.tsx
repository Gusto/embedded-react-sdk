import type React from 'react'
import { useMemo } from 'react'
import type { ComponentsContextType } from './useComponentContext'
import { ComponentsContext } from './useComponentContext'
import { internalComponents } from './adapters/internalComponentAdapter'

interface ComponentsProviderProps {
  children: React.ReactNode
  value: ComponentsContextType
}

export const ComponentsProvider = ({ children, value }: ComponentsProviderProps) => {
  const contextValue = useMemo(() => {
    return value
  }, [value]) // This is intentional to make the component context immutable

  return (
    <ComponentsContext.Provider value={{ ...contextValue, ...internalComponents }}>
      {children}
    </ComponentsContext.Provider>
  )
}
