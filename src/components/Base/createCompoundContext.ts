import { createContext, useContext } from 'react'

export function createCompoundContext<T>(contextName: string) {
  const context = createContext<T | null>(null)

  const useCompoundContext = () => {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`${contextName} must be used within its Provider.`)
    }
    return ctx
  }

  return [useCompoundContext, context.Provider] as const
}
