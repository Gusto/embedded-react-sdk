import { useState, useEffect, useCallback } from 'react'
import { BREAKPOINTS, BREAKPOOINTS_VALUES } from '@/shared/constants'
import { CustomPropertyValue } from './responsive'
import { useDebounce } from './useDebounce'
import { remToPx } from './rem'

export type BreakpointKey = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

export type Responsive<T> =
  | T
  | Partial<{
      [K in BreakpointKey]: T
    }>

type useBreakpointProps = {
  ref: React.RefObject<HTMLElement | null>
  breakpoints?: Responsive<CustomPropertyValue>
}

export const useContainerBreakpoints = ({
  ref,
  breakpoints = BREAKPOOINTS_VALUES,
}: useBreakpointProps) => {
  const [activeBreakpoints, setActiveBreakpoint] = useState<Array<keyof typeof breakpoints>>([])

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries.length > 0 && entries[0]) {
        const width = entries[0].contentRect.width
        const currentBreakpoints = activeBreakpoints

        for (const [key, value] of Object.entries(breakpoints)) {
          if (width >= remToPx(value)) {
            // Add key if not already in array
            if (!currentBreakpoints.includes(key as keyof typeof breakpoints)) {
              setActiveBreakpoint([...currentBreakpoints, key as keyof typeof breakpoints])
            }
          } else {
            // Remove Key if already in array
            if (currentBreakpoints.includes(key as keyof typeof breakpoints)) {
              setActiveBreakpoint(currentBreakpoints.filter(bp => bp !== key))
            }
          }
        }

        return
      }
    },
    [activeBreakpoints, breakpoints],
  )

  const debounceResizeHandler = useDebounce(handleResize, 50)

  // Observer
  useEffect(() => {
    const observer = new ResizeObserver(debounceResizeHandler)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref, debounceResizeHandler])

  return activeBreakpoints
}

export default useContainerBreakpoints
