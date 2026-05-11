import { NavLink } from 'react-router-dom'
import type { DemoChromeProps } from './types'
import styles from './AcmeHrChrome.module.scss'
import {
  DEMO_LINKS,
  HOME_ROUTE,
  PROFILE_ROUTE,
  WORKSPACE_LINKS,
  type ChromeSidebarLink,
} from './workspaceLinks'

const TOP_NAV_LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: HOME_ROUTE, label: 'Dashboard', end: true },
  { to: PROFILE_ROUTE, label: 'People' },
  { to: '/payroll/PayrollLanding', label: 'Payroll' },
]

function SidebarGroup({ title, links }: { title: string; links: ChromeSidebarLink[] }) {
  return (
    <nav className={styles.sidebarGroup} aria-label={title}>
      <div className={styles.sidebarHeader}>{title}</div>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AcmeHrChrome({ children, onOpenSettings }: DemoChromeProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <NavLink to={HOME_ROUTE} className={styles.brand} aria-label="Acme HR home">
          <span className={styles.logo} aria-hidden="true">
            ▣
          </span>
          <span className={styles.brandName}>Acme HR</span>
        </NavLink>
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
          <button type="button" className={styles.settingsBtn} onClick={onOpenSettings}>
            SDK Settings
          </button>
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
          <SidebarGroup title="Workspace" links={WORKSPACE_LINKS} />
          <SidebarGroup title="Demos" links={DEMO_LINKS} />
        </aside>

        <div className={styles.content}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Acme HR · Powered by Gusto Embedded</span>
      </footer>
    </div>
  )
}
