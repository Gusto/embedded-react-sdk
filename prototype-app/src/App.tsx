import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TokenBanner } from './TokenBanner'
import { useDemoManager, type TokenStatus } from './useDemoManager'
import styles from './App.module.scss'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

const TOKEN_STATUS_LABEL: Record<TokenStatus, string> = {
  valid: 'Token OK',
  expired: 'Token Expired',
  checking: 'Checking...',
  unknown: 'Checking...',
  none: 'No Token',
}

function useCompanyName(companyId: string) {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    if (!companyId) return

    fetch(`/api/v1/companies/${companyId}`, { signal: AbortSignal.timeout(10000) })
      .then(res => (res.ok ? (res.json() as Promise<{ name?: string }>) : null))
      .then(data => {
        if (data?.name) setName(data.name)
      })
      .catch(() => {})
  }, [companyId])

  return name
}

export function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const { tokenStatus } = useDemoManager()

  const companyId = String(import.meta.env.VITE_COMPANY_ID || '')
  const companyName = useCompanyName(companyId)

  return (
    <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }}>
      <div className={styles.layout}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.title}>
            Embedded React SDK<span>/ Design</span>
          </Link>
          <div className={styles.navSpacer} />
          <div className={styles.navInfo}>
            {companyName && (
              <span className={styles.navDetail} title={companyId}>
                <span className={styles.navLabel}>Company</span>
                {companyName}
              </span>
            )}
            {companyId && !companyName && (
              <span className={styles.navDetail} title={companyId}>
                <span className={styles.navLabel}>Company</span>
                {companyId.slice(0, 8)}...
              </span>
            )}
            <span className={styles.navDetail} title={companyId}>
              <span className={styles.navLabel}>Token</span>
              {companyId ? `...${companyId.slice(-12)}` : 'none'}
            </span>
            <div className={styles.tokenStatus}>
              <div className={`${styles.tokenDot} ${styles[`tokenDot--${tokenStatus}`]}`} />
              <span>{TOKEN_STATUS_LABEL[tokenStatus]}</span>
            </div>
          </div>
        </nav>
        <TokenBanner tokenStatus={tokenStatus} />
        <div className={styles.body}>
          <Sidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </GustoProvider>
  )
}
