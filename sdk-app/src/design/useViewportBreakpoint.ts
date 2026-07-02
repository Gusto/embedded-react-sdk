import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  breakpointToMaxWidth,
  breakpointToParam,
  parseBreakpointParam,
} from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'

/**
 * Reads and writes the active preview viewport via the `?vw=` URL param so a
 * comment's recorded route carries the width it was made at — selecting it later
 * restores that layout. The param is omitted for the default (Full/unconstrained)
 * width so ordinary URLs stay clean.
 */
export function useViewportBreakpoint() {
  const [searchParams, setSearchParams] = useSearchParams()
  const breakpoint = parseBreakpointParam(searchParams.get('vw'))

  const setBreakpoint = useCallback(
    (key: BreakpointOption) => {
      const next = new URLSearchParams(searchParams)
      if (key === null) next.delete('vw')
      else next.set('vw', breakpointToParam(key))
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // Normalize the URL: strip an invalid/redundant token and drop it entirely for
  // the default width, so a bare URL always means "Full".
  useEffect(() => {
    const current = searchParams.get('vw')
    const desired = breakpoint === null ? null : breakpointToParam(breakpoint)
    if (current === desired) return
    const next = new URLSearchParams(searchParams)
    if (desired === null) next.delete('vw')
    else next.set('vw', desired)
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, breakpoint])

  return { breakpoint, setBreakpoint, maxWidth: breakpointToMaxWidth(breakpoint) }
}
