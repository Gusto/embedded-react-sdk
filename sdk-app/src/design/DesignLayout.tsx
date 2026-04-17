import { Outlet } from 'react-router-dom'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  return (
    <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }}>
      <div className={styles.root}>
        <Outlet />
      </div>
    </GustoProvider>
  )
}
