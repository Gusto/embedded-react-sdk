import { useState } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import { breakpointToMaxWidth } from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const [breakpoint, setBreakpoint] = useState<BreakpointOption>('large')
  const resolvedTheme = useResolvedTheme()

  const maxWidth = breakpointToMaxWidth(breakpoint)

  return (
    <GustoProvider
      config={{ baseUrl: `${window.location.origin}/api/` }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
    >
      <div className={styles.bodyContent} style={maxWidth ? { maxWidth } : undefined}>
        <Outlet context={{ entities }} />
      </div>
      <div className={styles.switcherContainer}>
        <BreakpointSwitcher value={breakpoint} onChange={setBreakpoint} />
      </div>
    </GustoProvider>
  )
}
