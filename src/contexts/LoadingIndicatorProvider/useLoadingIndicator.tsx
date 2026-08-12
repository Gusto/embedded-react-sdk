import type { JSX } from 'react'
import { createContext, useContext } from 'react'
import { Loading } from '@/components/Common/Loading/Loading'

/**
 * Shape of the value stored in {@link LoadingIndicatorContext}.
 *
 * @internal
 */
export interface LoadingIndicatorContextProps {
  LoadingIndicator: ({
    children,
    height,
  }: {
    children?: React.ReactNode
    height?: number
  }) => JSX.Element
}
/**
 * React context holding the loading-indicator component used by SDK base components.
 *
 * @internal
 */
export const LoadingIndicatorContext = createContext<LoadingIndicatorContextProps>({
  LoadingIndicator: ({ children, height }: { children?: React.ReactNode; height?: number }) => (
    <Loading height={height}>{children}</Loading>
  ),
})

/**
 * Reads the loading-indicator component from {@link LoadingIndicatorContext}.
 *
 * @returns The current {@link LoadingIndicatorContextProps} value, falling back to the SDK default `Loading` component.
 * @internal
 */
export const useLoadingIndicator = () => useContext(LoadingIndicatorContext)
