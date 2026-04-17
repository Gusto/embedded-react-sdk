import { Outlet } from 'react-router-dom'
import styles from './DesignLayout.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

export function DesignLayout() {
  return (
    <div className={styles.bodyContent}>
      <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }}>
        <Outlet />
      </GustoProvider>
    </div>
  )
}
