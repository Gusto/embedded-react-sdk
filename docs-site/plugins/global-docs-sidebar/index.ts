import type { LoadContext, Plugin } from '@docusaurus/types'
import type { LoadedContent, LoadedVersion } from '@docusaurus/plugin-content-docs'
// Internal but stable utility: same fn the docs plugin uses to build the
// `docsSidebars` prop passed to each docs route. Re-exposing the result via
// globalData lets us render the docs sidebar tree on non-docs routes too
// (e.g. inside the mobile navbar on the landing page).
import { toSidebarsProp } from '@docusaurus/plugin-content-docs/lib/props.js'

export default function globalDocsSidebarPlugin(_context: LoadContext): Plugin<void> {
  return {
    name: 'global-docs-sidebar',
    async allContentLoaded({ allContent, actions }) {
      const docsContent = allContent['docusaurus-plugin-content-docs'] as
        | Record<string, LoadedContent>
        | undefined
      const defaultInstance = docsContent?.default
      if (!defaultInstance) return

      const versions = defaultInstance.loadedVersions
      const activeVersion: LoadedVersion | undefined = versions.find(v => v.isLast) ?? versions[0]
      if (!activeVersion) return

      const sidebars = toSidebarsProp(activeVersion)
      actions.setGlobalData({ items: sidebars.docs ?? [] })
    },
  }
}
