import type { LoadContext, Plugin } from '@docusaurus/types'
import type { LoadedContent, PropSidebarItem } from '@docusaurus/plugin-content-docs'
// Internal but stable utility: same fn the docs plugin uses to build the
// `docsSidebars` prop passed to each docs route. Re-exposing the result via
// globalData lets us render the docs sidebar tree on non-docs routes too
// (e.g. inside the mobile navbar on the landing page).
import { toSidebarsProp } from '@docusaurus/plugin-content-docs/lib/props.js'

export type GlobalDocsSidebarData = {
  versions: { [versionName: string]: PropSidebarItem[] }
  latestVersionName: string | null
}

export default function globalDocsSidebarPlugin(_context: LoadContext): Plugin<void> {
  return {
    name: 'global-docs-sidebar',
    async allContentLoaded({ allContent, actions }) {
      const docsContent = allContent['docusaurus-plugin-content-docs'] as
        Record<string, LoadedContent> | undefined
      const defaultInstance = docsContent?.default
      if (!defaultInstance) {
        actions.setGlobalData({ versions: {}, latestVersionName: null })
        return
      }

      const loadedVersions = defaultInstance.loadedVersions
      const versions: { [versionName: string]: PropSidebarItem[] } = {}
      for (const version of loadedVersions) {
        const sidebars = toSidebarsProp(version)
        versions[version.versionName] = sidebars.docs ?? []
      }
      const latestVersionName =
        loadedVersions.find(v => v.isLast)?.versionName ?? loadedVersions[0]?.versionName ?? null
      actions.setGlobalData({ versions, latestVersionName } satisfies GlobalDocsSidebarData)
    },
  }
}
