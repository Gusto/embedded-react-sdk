import { useCallback, useEffect } from 'react'
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import { BreakpointSwitcher } from './BreakpointSwitcher'
import {
  breakpointToMaxWidth,
  breakpointToParam,
  parseBreakpointParam,
} from './breakpointConstants'
import type { BreakpointOption } from './breakpointConstants'
import { useComments } from './comments/CommentsContext'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const resolvedTheme = useResolvedTheme()
  const { trayOpen } = useComments()

  // The active viewport lives in the URL (`?vw=`) so a comment's recorded route
  // carries the width it was made at — selecting it later restores that layout.
  const [searchParams, setSearchParams] = useSearchParams()
  const rawVw = searchParams.get('vw')
  const breakpoint = parseBreakpointParam(rawVw)
  const canonicalVw = breakpointToParam(breakpoint)

  const setBreakpoint = useCallback(
    (key: BreakpointOption) => {
      const next = new URLSearchParams(searchParams)
      next.set('vw', breakpointToParam(key))
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // Keep the URL carrying a valid, canonical `vw` token so recorded routes are stable.
  useEffect(() => {
    if (rawVw !== canonicalVw) {
      const next = new URLSearchParams(searchParams)
      next.set('vw', canonicalVw)
      setSearchParams(next, { replace: true })
    }
  }, [rawVw, canonicalVw, searchParams, setSearchParams])

  const maxWidth = breakpointToMaxWidth(breakpoint)

  return (
    <GustoProvider
      config={{ baseUrl: `${window.location.origin}/api/` }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
    >
      <div className={styles.shell}>
        <main className={styles.bodyArea}>
          <div className={styles.bodyContent} style={maxWidth ? { maxWidth } : undefined}>
            <Outlet context={{ entities }} />
          </div>
        </main>
        <div id={DESIGN_RIGHT_RAIL_ID} className={styles.rightRail} />
      </div>
      <div
        className={`${styles.switcherContainer} ${trayOpen ? styles.switcherContainerShifted : ''}`}
      >
        <BreakpointSwitcher value={breakpoint} onChange={setBreakpoint} />
      </div>
    </GustoProvider>
  )
}

export const DESIGN_RIGHT_RAIL_ID = 'design-right-rail'
