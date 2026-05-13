import { useEffect, useId, useRef, useState } from 'react'
import { ModeSwitcher } from './ModeSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useAppMode } from './useAppMode'
import { useCompanyName } from './design/useCompanyName'
import type { TokenStatus } from './useDemoManager'
import SettingsIcon from './assets/icons/icon-settings.svg?react'
import CodeIcon from './assets/icons/icon-code.svg?react'
import PaletteIcon from './assets/icons/icon-palette.svg?react'
import ChevronDownIcon from './assets/icons/icon-chevron-down.svg?react'
import styles from './TopBar.module.scss'

type ActivePanel = 'theme' | 'settings' | 'code' | null

interface TopBarProps {
  companyId: string
  tokenStatus: TokenStatus
  activePanel: ActivePanel
  onPanelToggle: (panel: 'theme' | 'settings' | 'code') => void
}

function TokenDot({ status, compact = false }: { status: TokenStatus; compact?: boolean }) {
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

  if (compact) {
    return <div className={`${styles.tokenDot} ${dotClass}`} title={label} aria-label={label} />
  }

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

export function TopBar({ companyId, tokenStatus, activePanel, onPanelToggle }: TopBarProps) {
  const mode = useAppMode()
  const rawEnv = typeof __SDK_APP_ENV__ !== 'undefined' ? __SDK_APP_ENV__ : 'demo'
  const displayEnv = rawEnv === 'localzp' ? 'local' : rawEnv
  const build = typeof __SDK_APP_BUILD__ !== 'undefined' ? __SDK_APP_BUILD__ : 'dev'
  const demoType = import.meta.env.VITE_DEMO_TYPE || ''
  const demoTypeLabel = DEMO_TYPE_LABELS[demoType] || demoType
  const companyName = useCompanyName(companyId)
  const [infoOpen, setInfoOpen] = useState(false)
  const infoWrapRef = useRef<HTMLDivElement>(null)
  const infoPanelId = useId()

  useEffect(() => {
    if (!infoOpen) return
    const handleClick = (e: MouseEvent) => {
      if (infoWrapRef.current && !infoWrapRef.current.contains(e.target as Node)) {
        setInfoOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInfoOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [infoOpen])

  return (
    <header className={styles.root}>
      <span className={styles.title}>
        SDK Dev App{mode === 'design' && <span className={styles.designTitle}>/ Design</span>}
      </span>

      <div className={styles.rightBar}>
        <div
          className={`${styles.envInfoWrap} ${infoOpen ? styles.envInfoWrapOpen : ''}`}
          ref={infoWrapRef}
        >
          <button
            type="button"
            className={styles.infoToggle}
            onClick={() => {
              setInfoOpen(o => !o)
            }}
            aria-expanded={infoOpen}
            aria-controls={infoPanelId}
            aria-label={infoOpen ? 'Hide environment info' : 'Show environment info'}
            title="Environment info"
          >
            <span className={styles.infoToggleSummary}>
              <TokenDot status={tokenStatus} compact />
            </span>
            <ChevronDownIcon className={styles.infoToggleChevron} />
          </button>
          <div id={infoPanelId} className={styles.envInfo}>
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
            {companyName && (
              <span className={styles.company} title={companyId}>
                <span className={styles.badgeLabel}>Company</span>
                <span className={styles.companyValue}>{companyName}</span>
              </span>
            )}
            {companyId && !companyName && (
              <span className={styles.company} title={companyId}>
                <span className={styles.badgeLabel}>Company</span>
                <span className={styles.companyValue}>{companyId}</span>
              </span>
            )}
            <TokenDot status={tokenStatus} />
          </div>
        </div>

        <div className={styles.actions}>
          <ThemeSwitcher />
          <ModeSwitcher />
          <div className={styles.panelBtnGroup}>
            <button
              className={`${styles.panelBtn} ${activePanel === 'theme' ? styles.panelBtnActive : ''}`}
              onClick={() => {
                onPanelToggle('theme')
              }}
              type="button"
              aria-pressed={activePanel === 'theme'}
              aria-label="Toggle theme panel"
              title="Toggle theme panel (⌘J)"
            >
              <PaletteIcon />
              <span className={styles.panelBtnLabel}>Theme</span>
            </button>
            <button
              className={`${styles.panelBtn} ${activePanel === 'settings' ? styles.panelBtnActive : ''}`}
              onClick={() => {
                onPanelToggle('settings')
              }}
              type="button"
              aria-pressed={activePanel === 'settings'}
              aria-label="Toggle settings panel"
              title="Toggle settings panel (⌘,)"
            >
              <SettingsIcon />
              <span className={styles.panelBtnLabel}>Settings</span>
            </button>
            <button
              className={`${styles.panelBtn} ${activePanel === 'code' ? styles.panelBtnActive : ''}`}
              onClick={() => {
                onPanelToggle('code')
              }}
              type="button"
              aria-pressed={activePanel === 'code'}
              aria-label="Toggle code panel"
              title="Toggle code panel (?)"
            >
              <CodeIcon />
              <span className={styles.panelBtnLabel}>Code</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
