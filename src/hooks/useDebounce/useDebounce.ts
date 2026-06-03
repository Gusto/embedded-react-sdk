import { useEffect, useRef } from 'react'

/**
 * Returns a debounced version of `func` that delays invocation until `wait` milliseconds have elapsed since the last call.
 *
 * @remarks
 * Each call resets the pending timer, so only the final invocation in a burst runs. The pending timer is cleared when the host component unmounts.
 *
 * @typeParam T - The function being debounced.
 * @param func - The function to invoke after the delay.
 * @param wait - Delay in milliseconds before invoking `func` after the last call.
 * @returns A function that schedules `func` and discards the return value.
 * @internal
 */
export function useDebounce<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any,
>(func: T, wait: number): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear the existing timeout when component unmounts
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    [timeoutRef],
  )

  return (...args: Parameters<T>) => {
    // Clear the existing timeout before setting a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Default export alias for {@link useDebounce}.
 *
 * @internal
 */
export default useDebounce
