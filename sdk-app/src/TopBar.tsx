import type { TokenStatus } from './useDemoManager'

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

  return (
    <div className="topbar-token-status">
      <div className={`topbar-token-dot topbar-token-dot--${status}`} />
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
    <header className="topbar">
      <span className="topbar-title">SDK Dev App</span>
      <div className="topbar-divider" />
      <span
        className="topbar-badge topbar-badge--env"
        title="ZenPayroll environment (demo, staging, or local)"
      >
        <span className="topbar-badge-label">API</span>
        {displayEnv}
      </span>
      <span
        className="topbar-badge topbar-badge--build"
        title="SDK build mode (dev = live source with HMR, prod = built dist)"
      >
        <span className="topbar-badge-label">SDK</span>
        {build}
      </span>
      {demoTypeLabel && (
        <span className="topbar-badge topbar-badge--demo-type" title={`Demo type: ${demoType}`}>
          {demoTypeLabel}
        </span>
      )}
      <div className="topbar-divider" />
      {companyId && (
        <span className="topbar-company" title={companyId}>
          <span className="topbar-badge-label">Company</span>
          {companyId}
        </span>
      )}
      <TokenDot status={tokenStatus} />
      <div className="topbar-spacer" />
      <button className="topbar-gear" onClick={onOpenSettings} type="button">
        Settings
      </button>
    </header>
  )
}
