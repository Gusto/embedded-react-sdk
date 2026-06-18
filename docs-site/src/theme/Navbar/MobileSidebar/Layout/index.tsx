import React, { version, type ReactNode } from 'react'
import clsx from 'clsx'
import { ThemeClassNames } from '@docusaurus/theme-common'
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle'
import type { Props } from '@theme/Navbar/MobileSidebar/Layout'
import styles from './styles.module.css'

function inertProps(inert: boolean) {
  const isBeforeReact19 = parseInt(version!.split('.')[0]!, 10) < 19
  if (isBeforeReact19) {
    return { inert: inert ? '' : undefined } as unknown as { inert: boolean }
  }
  return { inert }
}

function NavbarMobileSidebarPanel({ children, inert }: { children: ReactNode; inert: boolean }) {
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.panel,
        'navbar-sidebar__item menu',
      )}
      {...inertProps(inert)}
    >
      {children}
    </div>
  )
}

export default function NavbarMobileSidebarLayout({ header, primaryMenu }: Props): ReactNode {
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.container,
        'navbar-sidebar',
        styles.mobileSidebar,
      )}
    >
      {header}
      <div className={clsx('navbar-sidebar__items', styles.mobileSidebarItems)}>
        <NavbarMobileSidebarPanel inert={false}>{primaryMenu}</NavbarMobileSidebarPanel>
      </div>
      <div className={styles.mobileSidebarFooter}>
        <a
          href="https://github.com/Gusto/embedded-react-sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__link navbarGithub"
        >
          GitHub
        </a>
        <NavbarColorModeToggle />
      </div>
    </div>
  )
}
