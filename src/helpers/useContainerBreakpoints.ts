import { useState, useEffect, useCallback } from 'react'
import { BREAKPOINTS, BREAKPOINTS_VALUES } from '@/shared/constants'
import { CustomPropertyValue } from './responsive'
import { useDebounce } from './useDebounce'
import { remToPx } from './rem'
import React from 'react'

export type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

export type Responsive<T> =
  | T
  | Partial<{
      [K in BreakpointKey]: T
    }>

type useBreakpointProps = {
  ref: React.RefObject<HTMLElement | null>
  breakpoints?: Responsive<CustomPropertyValue>
  debounceTimeout?: number
}

const DEBOUNCE_TIMEOUT = 50

export const useContainerBreakpoints = ({
  ref,
  breakpoints = BREAKPOINTS_VALUES,
  debounceTimeout = DEBOUNCE_TIMEOUT,
}: useBreakpointProps) => {
  const [activeBreakpoints, setActiveBreakpoint] = useState<Array<keyof typeof breakpoints>>([])

  const handleResize = (entries: ResizeObserverEntry[]) => {
    if (entries.length > 0) {
      const width = entries[0]?.contentRect?.width ?? 0
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

      // console.log('Return breakpoints', returnBreakpoints)
      setActiveBreakpoint(returnBreakpoints)
    }
  }
  const debounceResizeHandler = useDebounce(handleResize, debounceTimeout)

  // Observer
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
