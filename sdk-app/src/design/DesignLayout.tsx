import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import { useAdapterComponents } from '../useAdapterModeContext'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import { breakpointToMaxWidth } from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const [breakpoint, setBreakpoint] = useState<BreakpointOption>('large')
  const resolvedTheme = useResolvedTheme()
  const adapterComponents = useAdapterComponents()

  const maxWidth = breakpointToMaxWidth(breakpoint)

  return (
    <GustoProvider
      config={{ baseUrl: `${window.location.origin}/api/` }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
      components={adapterComponents}
    >
      <div className={styles.bodyContent} style={maxWidth ? { maxWidth } : undefined}>
        <Outlet />
      </div>
      <div className={styles.switcherContainer}>
        <BreakpointSwitcher value={breakpoint} onChange={setBreakpoint} />
      </div>
    </GustoProvider>
  )
}
