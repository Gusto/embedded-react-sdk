import React, { type ReactNode } from 'react'
import { useLocation } from '@docusaurus/router'
import { usePluginData } from '@docusaurus/useGlobalData'
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal'
import { DocSidebarItemsExpandedStateProvider } from '@docusaurus/plugin-content-docs/client'
import DocSidebarItems from '@theme/DocSidebarItems'
import type { PropSidebar } from '@docusaurus/plugin-content-docs'

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const { items } = usePluginData('global-docs-sidebar') as { items: PropSidebar }
  const { pathname } = useLocation()
  const mobileSidebar = useNavbarMobileSidebar()
  return (
    <DocSidebarItemsExpandedStateProvider>
      <ul className="menu__list">
        <DocSidebarItems
          items={items}
          activePath={pathname}
          onItemClick={item => {
            if (item.type === 'category' && item.href) {
              mobileSidebar.toggle()
            }
            if (item.type === 'link') {
              mobileSidebar.toggle()
            }
          }}
          level={1}
        />
      </ul>
    </DocSidebarItemsExpandedStateProvider>
  )
}
