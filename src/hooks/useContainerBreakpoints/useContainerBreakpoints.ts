import { useState, useEffect } from 'react'
import type React from 'react'
import type { BREAKPOINTS } from '@/shared/constants'
import { BREAKPOINTS_VALUES } from '@/shared/constants'
import { useDebounce } from '@/hooks/useDebounce/useDebounce'
import { remToPx } from '@/helpers/rem'

export type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

export type useContainerBreakpointsProps = {
  ref: React.RefObject<HTMLElement | null>
  breakpoints?: Partial<{ [K in BreakpointKey]: number | string }>
  debounceTimeout?: number
}

const DEBOUNCE_TIMEOUT = 10

export const useContainerBreakpoints = ({
  ref,
  breakpoints = BREAKPOINTS_VALUES,
  debounceTimeout = DEBOUNCE_TIMEOUT,
}: useContainerBreakpointsProps) => {
  const [activeBreakpoints, setActiveBreakpoint] = useState<Array<keyof typeof breakpoints>>([])

  const handleResize = (entries: ResizeObserverEntry[]) => {
    if (entries.length >= 1) {
      const width = entries[0]?.contentRect.width ?? 0
      let returnBreakpoints = activeBreakpoints

      for (const [key, value] of Object.entries(breakpoints)) {
        if (
          width >= remToPx(value) &&
          !activeBreakpoints.includes(key as keyof typeof breakpoints)
        ) {
          // Add key if not already in array
          returnBreakpoints = [...returnBreakpoints, key as keyof typeof breakpoints]
        } else if (
          activeBreakpoints.includes(key as keyof typeof breakpoints) &&
          width < remToPx(value)
        ) {
          // Remove Key if already in array
          returnBreakpoints = activeBreakpoints.filter(bp => bp !== key)
        }
      }

      setActiveBreakpoint(returnBreakpoints)
    }
  }
  const debounceResizeHandler = useDebounce(handleResize, debounceTimeout)

  useEffect(() => {
    const observer = new ResizeObserver(debounceResizeHandler)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [debounceResizeHandler, ref])

  return activeBreakpoints
}

export default useContainerBreakpoints
