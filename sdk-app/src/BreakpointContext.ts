import { createContext } from 'react'
import type { BreakpointOption } from './breakpointConstants'

export interface BreakpointContextValue {
  breakpoint: BreakpointOption
  setBreakpoint: (breakpoint: BreakpointOption) => void
}

export const BreakpointContext = createContext<BreakpointContextValue>({
  breakpoint: 'large',
  setBreakpoint: () => {},
})

export const BreakpointProvider = BreakpointContext.Provider
