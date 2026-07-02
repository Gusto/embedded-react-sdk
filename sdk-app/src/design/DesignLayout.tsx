import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import { breakpointToMaxWidth, parseBreakpointParam } from './breakpointConstants'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const resolvedTheme = useResolvedTheme()

  // The active viewport lives in the URL (`?vw=`) and is driven app-wide by the
  // switcher in App; here we only read it to constrain the preview column.
  const [searchParams] = useSearchParams()
  const maxWidth = breakpointToMaxWidth(parseBreakpointParam(searchParams.get('vw')))

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
    </GustoProvider>
  )
}

export const DESIGN_RIGHT_RAIL_ID = 'design-right-rail'
