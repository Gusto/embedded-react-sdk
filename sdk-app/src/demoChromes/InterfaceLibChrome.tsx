import { NavLink } from 'react-router-dom'
import { Button } from '../InterfaceLib'
import type { DemoChromeProps } from './types'
import styles from './InterfaceLibChrome.module.scss'
import {
  DEMO_LINKS,
  PROFILE_ROUTE,
  TOP_NAV_LINKS,
  WORKSPACE_LINKS,
  type ChromeSidebarLink,
} from './workspaceLinks'

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
          <SidebarGroup title="Workspace" links={WORKSPACE_LINKS} />
          <SidebarGroup title="Demos" links={DEMO_LINKS} />
        </aside>

        <div className={styles.content}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <span>Partner Dashboard · Powered by Gusto Embedded</span>
      </footer>
    </div>
  )
}
