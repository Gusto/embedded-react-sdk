import { useContext } from 'react'
import { BreakpointContext } from './BreakpointContext'
import { breakpointToMaxWidth } from './breakpointConstants'

export function useBreakpointContext() {
  return useContext(BreakpointContext)
}

export function useBreakpointMaxWidth(): number | undefined {
  const { breakpoint } = useContext(BreakpointContext)
  return breakpointToMaxWidth(breakpoint)
}
