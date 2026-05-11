import { Outlet, useOutletContext } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { useResolvedTheme } from '../useThemeModeContext'
import { useBreakpointMaxWidth } from '../useBreakpointContext'
import { darkTheme } from '../darkTheme'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const resolvedTheme = useResolvedTheme()
  const maxWidth = useBreakpointMaxWidth()

  return (
    <GustoProvider
      config={{ baseUrl: `${window.location.origin}/api/` }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
    >
      <div className={styles.bodyContent} style={maxWidth ? { maxWidth } : undefined}>
        <Outlet context={{ entities }} />
      </div>
    </GustoProvider>
  )
}
