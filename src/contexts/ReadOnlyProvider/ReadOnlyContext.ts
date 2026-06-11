import { createContext } from 'react'

/**
 * Indicates whether SDK components should suppress write actions and block mutating requests.
 *
 * @public
 */
export interface ReadOnlyContextValue {
  /** True when the SDK is rendering in read-only mode. */
  readOnly: boolean
}

/** @internal */
export const ReadOnlyContext = createContext<ReadOnlyContextValue>({ readOnly: false })
