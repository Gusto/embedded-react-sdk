import { useContext } from 'react'
import { ReadOnlyContext } from './ReadOnlyContext'
import type { ReadOnlyContextValue } from './ReadOnlyContext'

/**
 * Reads the current SDK read-only setting.
 *
 * @returns The current read-only context value.
 * @public
 */
export function useReadOnly(): ReadOnlyContextValue {
  return useContext(ReadOnlyContext)
}
