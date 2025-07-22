import { useState, useEffect, useRef } from 'react'
import type React from 'react'
import type { BREAKPOINTS } from '@/shared/constants'
import { BREAKPOINTS_VALUES } from '@/shared/constants'
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const calculateBreakpoints = (width: number) => {
    const returnBreakpoints: Array<keyof typeof breakpoints> = []

    for (const [key, value] of Object.entries(breakpoints)) {
      if (width >= remToPx(value)) {
        returnBreakpoints.push(key as keyof typeof breakpoints)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceTimeout])

  return activeBreakpoints
}

export default useContainerBreakpoints
