import { useState, useEffect, useRef } from 'react'
import type React from 'react'

export type UseOverflowDetectionProps = {
  ref: React.RefObject<HTMLElement | null>
  debounceTimeout?: number
}

const DEBOUNCE_TIMEOUT = 10

export const useOverflowDetection = ({
  ref,
  debounceTimeout = DEBOUNCE_TIMEOUT,
}: UseOverflowDetectionProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const checkOverflow = (element: HTMLElement) => {
    const hasOverflow = element.scrollHeight > element.clientHeight
    setIsOverflowing(hasOverflow)
  }

  useEffect(() => {
    const debouncedHandleResize = (entries: ResizeObserverEntry[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (entries.length >= 1 && entries[0]) {
          const element = entries[0].target as HTMLElement
          checkOverflow(element)
        }
      }, debounceTimeout)
    }

    const observer = new ResizeObserver(debouncedHandleResize)

    if (ref.current) {
      checkOverflow(ref.current)
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceTimeout])

  return isOverflowing
}

export default useOverflowDetection
