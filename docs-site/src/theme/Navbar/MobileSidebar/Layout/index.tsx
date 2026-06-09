import React, { version, type ReactNode } from 'react'
import clsx from 'clsx'
import { useNavbarSecondaryMenu } from '@docusaurus/theme-common/internal'
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

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
  secondaryMenu,
}: Props): ReactNode {
  const { shown: secondaryMenuShown } = useNavbarSecondaryMenu()
  return (
    <div
      className={clsx(
        ThemeClassNames.layout.navbar.mobileSidebar.container,
        'navbar-sidebar',
        styles.mobileSidebar,
      )}
    >
      {header}
      <div
        className={clsx('navbar-sidebar__items', styles.mobileSidebarItems, {
          'navbar-sidebar__items--show-secondary': secondaryMenuShown,
        })}
      >
        <NavbarMobileSidebarPanel inert={secondaryMenuShown}>
          {primaryMenu}
        </NavbarMobileSidebarPanel>
        <NavbarMobileSidebarPanel inert={!secondaryMenuShown}>
          {secondaryMenu}
        </NavbarMobileSidebarPanel>
      </div>
      <div className={styles.mobileSidebarFooter}>
        <NavbarColorModeToggle />
      </div>
    </div>
  )
}
