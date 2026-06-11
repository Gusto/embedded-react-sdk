import { createContext, useContext, type ReactNode } from 'react'

/**
 * Indicates whether SDK components should suppress write actions and block mutating requests.
 *
 * @public
 */
export interface ReadOnlyContextValue {
  /** True when the SDK is rendering in read-only mode. */
  readOnly: boolean
}

const ReadOnlyContext = createContext<ReadOnlyContextValue>({ readOnly: false })

/**
 * Provides the SDK's read-only setting to descendants.
 *
 * @param props - Provider props containing the read-only value and children.
 * @returns The provider wrapping `children`.
 * @public
 */
export function ReadOnlyProvider({
  children,
  readOnly = false,
}: {
  children: ReactNode
  readOnly?: boolean
}) {
  return (
    <ReadOnlyContext.Provider value={{ readOnly: Boolean(readOnly) }}>
      {children}
    </ReadOnlyContext.Provider>
  )
}

/**
 * Reads the current SDK read-only setting.
 *
 * @returns The current read-only context value.
 * @public
 */
export function useReadOnly() {
  return useContext(ReadOnlyContext)
}
