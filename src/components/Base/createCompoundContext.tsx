import { createContext, useContext } from 'react'

export function createCompoundContext<T>(contextName: string, defaultValue: T | null = null) {
  const context = createContext<T | null>(defaultValue)

  const useCompoundContext = () => {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`${contextName} must be used within its Provider.`)
    }
    return ctx
  }

  return [useCompoundContext, context.Provider] as const
}
