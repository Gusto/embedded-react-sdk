import React from 'react'
/**
 * Triggers re-render of a component to allow ErrorBoundary to catch a thrown error - that way we can handle all exceptions from asynchrounous functions in the same way and catch them in react boundary
 * @returns Function
 */
export const useAsyncError = () => {
  const [_, setError] = React.useState()
  return React.useCallback(
    (e: unknown) => {
      const err = e instanceof Error ? e : new Error(typeof e === 'string' ? e : 'Unknown error')
      setError(() => {
        throw err
      })
    },
    [setError],
  )
}
