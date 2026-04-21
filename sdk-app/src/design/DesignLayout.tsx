import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import { breakpointToMaxWidth } from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const [breakpoint, setBreakpoint] = useState<BreakpointOption>('large')

  const maxWidth = breakpointToMaxWidth(breakpoint)

  return (
    <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }}>
      <div className={styles.bodyContent} style={maxWidth ? { maxWidth } : undefined}>
        <Outlet />
      </div>
      <div className={styles.switcherContainer}>
        <BreakpointSwitcher value={breakpoint} onChange={setBreakpoint} />
      </div>
    </GustoProvider>
  )
}
