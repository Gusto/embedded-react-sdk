import { useState, useEffect, useRef } from 'react'
import type React from 'react'
import { BREAKPOINTS_VALUES } from '@/shared/constants'
import { remToPx } from '@/helpers/rem'

/**
 * Options for {@link useContainerBreakpoints}.
 *
 * @internal
 */
export type useContainerBreakpointsProps = {
  /** Ref to the container element whose width drives breakpoint matching. */
  ref: React.RefObject<HTMLElement | null>
  /** Map of breakpoint name to minimum width (rem string or px number). Defaults to the SDK's `BREAKPOINTS_VALUES`. */
  breakpoints?: Record<string, number | string>
  /** Debounce delay in milliseconds applied to resize updates. Defaults to 10. */
  debounceTimeout?: number
}

const DEBOUNCE_TIMEOUT = 10

/**
 * Tracks which named breakpoints are currently satisfied by the observed container's width.
 *
 * @remarks
 * Uses `ResizeObserver` on the referenced element and recomputes (debounced) which breakpoints
 * are active by comparing the element's width against each entry in `breakpoints`. Returned
 * keys are every breakpoint whose minimum width is less than or equal to the current container width.
 *
 * @param props - {@link useContainerBreakpointsProps} with the container ref and optional breakpoint map.
 * @returns The array of breakpoint keys currently active for the container.
 * @internal
 */
export const useContainerBreakpoints = ({
  ref,
  breakpoints = BREAKPOINTS_VALUES,
  debounceTimeout = DEBOUNCE_TIMEOUT,
}: useContainerBreakpointsProps) => {
  const [activeBreakpoints, setActiveBreakpoint] = useState<Array<keyof typeof breakpoints>>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const calculateBreakpoints = (width: number) => {
    const returnBreakpoints: Array<keyof typeof breakpoints> = []

    for (const [key, value] of Object.entries(breakpoints)) {
      if (width >= remToPx(value)) {
        returnBreakpoints.push(key)
      }
    }

    return returnBreakpoints
  }

  useEffect(() => {
    const debouncedHandleResize = (entries: ResizeObserverEntry[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (entries.length >= 1) {
          const width = entries[0]?.contentRect.width ?? 0
          const newBreakpoints = calculateBreakpoints(width)
          setActiveBreakpoint(newBreakpoints)
        }
      }, debounceTimeout)
    }

    const observer = new ResizeObserver(debouncedHandleResize)

    if (ref.current) {
      // Do initial calculation
      const width = ref.current.offsetWidth
      if (width > 0) {
        const initialBreakpoints = calculateBreakpoints(width)
        setActiveBreakpoint(initialBreakpoints)
      }

      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceTimeout])

  return activeBreakpoints
}

export default useContainerBreakpoints
