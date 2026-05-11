import { NavLink } from 'react-router-dom'
import { Button } from '../InterfaceLib'
import type { DemoChromeProps } from './types'
import styles from './InterfaceLibChrome.module.scss'

const HOME_ROUTE = '/company/OnboardingOverview'
const PROFILE_ROUTE = '/employee/Profile'

const TOP_NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: HOME_ROUTE, label: 'Dashboard', end: true },
  { to: PROFILE_ROUTE, label: 'People' },
  { to: '/payroll/PayrollLanding', label: 'Payroll' },
  { to: '/company/DocumentList', label: 'Documents' },
]

const SIDEBAR_LINKS: { to: string; label: string }[] = [
  { to: PROFILE_ROUTE, label: 'Employees' },
  { to: '/employee/OnboardingFlow', label: 'Onboarding' },
  { to: '/employee/Compensation', label: 'Compensation' },
  { to: '/payroll/PayrollFlow', label: 'Run Payroll' },
  { to: '/company/DocumentList', label: 'Documents' },
  { to: '/company/BankAccount', label: 'Bank Account' },
  { to: '/company/PaySchedule', label: 'Pay Schedule' },
]

export function InterfaceLibChrome({ children, onOpenSettings }: DemoChromeProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.topNav} aria-label="Primary">
          {TOP_NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `${styles.topLink} ${isActive ? styles.topLinkActive : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={onOpenSettings} className={styles.settingsBtn}>
            SDK Settings
          </Button>
          <NavLink
            to={PROFILE_ROUTE}
            className={styles.avatar}
            aria-label="View profile"
            title="View profile"
          >
            JD
          </NavLink>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Workspace navigation">
          <div className={styles.sidebarHeader}>Workspace</div>
          {SIDEBAR_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </aside>

        <div className={styles.content}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <span>Partner Dashboard · Powered by Gusto Embedded</span>
      </footer>
    </div>
  )
}
