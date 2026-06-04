import { createContext, useContext } from 'react'

/**
 * Creates a React context paired with a hook that throws if used outside of its provider.
 *
 * @remarks
 * Used to build compound components that share state between a top-level container and its
 * subcomponents. The returned hook reads the context value and throws an error referencing
 * `contextName` when no provider is mounted, eliminating the need for a null-check at each call site.
 *
 * @typeParam T - The shape of the context value.
 * @param contextName - Human-readable name used in the error message when the hook is called outside a provider.
 * @param defaultValue - Optional default value for the underlying context; defaults to `null`.
 * @returns A tuple of `[useContext, Provider]` where `useContext` reads the value or throws, and `Provider` is the React context provider component.
 * @internal
 */
export function createCompoundContext<T>(contextName: string, defaultValue: T | null = null) {
  const context = createContext(defaultValue)

  const useCompoundContext = () => {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`${contextName} must be used within its Provider.`)
    }
    return ctx
  }

  return [useCompoundContext, context.Provider] as const
}
