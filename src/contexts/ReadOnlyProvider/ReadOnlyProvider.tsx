import type { ReactNode } from 'react'
import { ReadOnlyContext } from './ReadOnlyContext'

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
  return <ReadOnlyContext.Provider value={{ readOnly }}>{children}</ReadOnlyContext.Provider>
}
