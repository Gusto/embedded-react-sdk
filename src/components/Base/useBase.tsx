import { createContext, useContext } from 'react'
import { type EventType } from '@/shared/constants'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { SDKError } from '@/types/sdkError'

/**
 * Callback signature for an SDK component event emitter, invoked with an event key and optional payload.
 *
 * @remarks
 * Supply a function of this shape as the `onEvent` prop on any SDK feature component.
 * The `type` argument is always one of the constants from `componentEvents`. The `data`
 * argument is event-specific — some events carry no payload while others include the full
 * API response body. Refer to each component's event table for details.
 *
 * @typeParam K - The discriminating event-key type, typically a {@link componentEvents} member.
 * @typeParam T - The shape of the optional event payload.
 * @public
 */
export type OnEventType<K, T> = (type: K, data?: T) => void

interface BaseContextProps {
  error: SDKError | null
  setError: (err: SDKError | null) => void
  onEvent: OnEventType<EventType, unknown>
  baseSubmitHandler: <T>(
    formData: T,
    componentHandler: (payload: T) => Promise<void>,
  ) => Promise<void>
  LoadingIndicator: LoadingIndicatorContextProps['LoadingIndicator']
  componentName?: string
}

/**
 * React context holding the shared error state, submit handler, event emitter, and loading indicator provided by {@link BaseComponent}.
 *
 * @internal
 */
export const BaseContext = createContext<BaseContextProps | undefined>(undefined)

/**
 * Reads the {@link BaseContext} value provided by {@link BaseComponent}, throwing if used outside one.
 *
 * @returns The context value containing `error`, `setError`, `onEvent`, `baseSubmitHandler`, `LoadingIndicator`, and the optional `componentName`.
 * @throws Throws an `Error` when called outside of a {@link BaseComponent} (or other `BaseContext.Provider`) subtree.
 * @internal
 */
export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}
