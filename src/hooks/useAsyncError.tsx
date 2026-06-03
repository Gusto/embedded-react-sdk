import React from 'react'
/**
 * Surfaces an asynchronous error to the nearest React `ErrorBoundary`.
 *
 * @remarks
 * Errors thrown inside async callbacks (event handlers, effects, promises) are not caught by
 * React's error boundary machinery. The returned callback schedules a state update that re-throws
 * the supplied error during render, which causes the boundary to receive it like any sync error.
 *
 * Non-`Error` values are coerced — strings become the error message, anything else becomes
 * `"Unknown error"`.
 *
 * @returns A callback that, when invoked with an error, triggers the surrounding error boundary.
 * @internal
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
