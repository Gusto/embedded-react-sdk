import { NavLink } from 'react-router-dom'
import type { DemoChromeProps } from './types'
import styles from './AcmeHrChrome.module.scss'

const NAV_LINKS: { to: string; label: string }[] = [
  { to: '/employee/Profile', label: 'Employees' },
  { to: '/employee/OnboardingFlow', label: 'Onboarding' },
  { to: '/employee/Compensation', label: 'Compensation' },
  { to: '/payroll/PayrollExecutionFlow', label: 'Run Payroll' },
  { to: '/company/DocumentList', label: 'Documents' },
]

export function AcmeHrChrome({ children, onOpenSettings }: DemoChromeProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            ▣
          </span>
          <span className={styles.brandName}>Acme HR</span>
        </div>
        <nav className={styles.topNav} aria-label="Primary">
          <NavLink to="/" className={styles.topLink} end>
            Dashboard
          </NavLink>
          <NavLink to="/employee/Profile" className={styles.topLink}>
            People
          </NavLink>
          <NavLink to="/payroll/PayrollExecutionFlow" className={styles.topLink}>
            Payroll
          </NavLink>
        </nav>
        <div className={styles.headerActions}>
          <button type="button" className={styles.settingsBtn} onClick={onOpenSettings}>
            SDK Settings
          </button>
          <span className={styles.avatar} aria-hidden="true">
            JD
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Workspace navigation">
          <div className={styles.sidebarHeader}>Workspace</div>
          <nav>
            {NAV_LINKS.map(link => (
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
          </nav>
        </aside>

        <div className={styles.content}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Acme HR · Powered by Gusto Embedded</span>
      </footer>
    </div>
  )
}
