import type { ReactNode } from 'react'
import { LoadingIndicatorContext, type LoadingIndicatorContextProps } from './useLoadingIndicator'
import { Loading } from '@/components/Common/Loading/Loading'

/**
 * Props for {@link LoadingIndicatorProvider}.
 *
 * @internal
 */
export interface LoadingIndicatorProviderProps {
  children: ReactNode
  value?: LoadingIndicatorContextProps['LoadingIndicator']
}

/**
 * Provides the loading-indicator component to SDK base components via {@link LoadingIndicatorContext}.
 *
 * @remarks
 * When `value` is omitted, the SDK's default `Loading` component is used. Composed by `GustoProvider`
 * so a partner-supplied `LoaderComponent` flows through to every internal Suspense fallback.
 *
 * @param props - See {@link LoadingIndicatorProviderProps}.
 * @returns A React subtree with the loading-indicator context applied.
 * @internal
 */
export function LoadingIndicatorProvider({ children, value }: LoadingIndicatorProviderProps) {
  return (
    <LoadingIndicatorContext.Provider value={{ LoadingIndicator: value ?? Loading }}>
      {children}
    </LoadingIndicatorContext.Provider>
  )
}
