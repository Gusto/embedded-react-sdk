import type { TokenStatus } from './useDemoManager'
import styles from './TopBar.module.scss'

interface TopBarProps {
  companyId: string
  tokenStatus: TokenStatus
  onOpenSettings: () => void
}

function TokenDot({ status }: { status: TokenStatus }) {
  const label =
    status === 'valid'
      ? 'Token OK'
      : status === 'expired'
        ? 'Token Expired'
        : status === 'checking'
          ? 'Checking...'
          : 'Unknown'

  const dotClass = {
    valid: styles.tokenDotValid,
    expired: styles.tokenDotExpired,
    checking: styles.tokenDotChecking,
    unknown: styles.tokenDotUnknown,
  }[status]

  return (
    <div className={styles.tokenStatus}>
      <div className={`${styles.tokenDot} ${dotClass}`} />
      <span>{label}</span>
    </div>
  )
}

const DEMO_TYPE_LABELS: Record<string, string> = {
  react_sdk_demo_company_onboarded: 'Company Onboarded',
  react_sdk_demo: 'New Company',
}

export function TopBar({ companyId, tokenStatus, onOpenSettings }: TopBarProps) {
  const rawEnv = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const displayEnv = rawEnv === 'localzp' ? 'local' : rawEnv
  const build = typeof __SDK_APP_BUILD__ !== 'undefined' ? __SDK_APP_BUILD__ : 'dev'
  const demoType = import.meta.env.VITE_DEMO_TYPE || ''
  const demoTypeLabel = DEMO_TYPE_LABELS[demoType] || demoType
  return (
    <header className={styles.root}>
      <span className={styles.title}>SDK Dev App</span>
      <div className={styles.divider} />
      <span
        className={`${styles.badge} ${styles.badgeEnv}`}
        title="ZenPayroll environment (demo, staging, or local)"
      >
        <span className={styles.badgeLabel}>API</span>
        {displayEnv}
      </span>
      <span
        className={`${styles.badge} ${styles.badgeBuild}`}
        title="SDK build mode (dev = live source with HMR, prod = built dist)"
      >
        <span className={styles.badgeLabel}>SDK</span>
        {build}
      </span>
      {demoTypeLabel && (
        <span
          className={`${styles.badge} ${styles.badgeDemoType}`}
          title={`Demo type: ${demoType}`}
        >
          {demoTypeLabel}
        </span>
      )}
      <div className={styles.divider} />
      {companyId && (
        <span className={styles.company} title={companyId}>
          <span className={styles.badgeLabel}>Company</span>
          {companyId}
        </span>
      )}
      <TokenDot status={tokenStatus} />
      <div className={styles.spacer} />
      <button className={styles.gear} onClick={onOpenSettings} type="button">
        Settings
      </button>
    </header>
  )
}
