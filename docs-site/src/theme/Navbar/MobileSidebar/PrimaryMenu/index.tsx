import React, { type ReactNode } from 'react'
import { useLocation } from '@docusaurus/router'
import { usePluginData } from '@docusaurus/useGlobalData'
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal'
import {
  DocSidebarItemsExpandedStateProvider,
  useActiveDocContext,
  useDocsPreferredVersion,
} from '@docusaurus/plugin-content-docs/client'
import DocSidebarItems from '@theme/DocSidebarItems'
import SidebarVersionSelect from '@site/src/components/SidebarVersionSelect'
import type { GlobalDocsSidebarData } from '@site/plugins/global-docs-sidebar'

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const data = usePluginData('global-docs-sidebar') as GlobalDocsSidebarData
  const { pathname } = useLocation()
  const mobileSidebar = useNavbarMobileSidebar()
  const activeDocContext = useActiveDocContext(undefined)
  const { preferredVersion } = useDocsPreferredVersion(undefined)

  const selectedVersionName =
    activeDocContext.activeVersion?.name ?? preferredVersion?.name ?? data.latestVersionName
  const items = (selectedVersionName && data.versions[selectedVersionName]) ?? []

  return (
    <DocSidebarItemsExpandedStateProvider>
      <ul className="menu__list">
        <SidebarVersionSelect />
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
