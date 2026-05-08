import { componentRegistry } from '../registry'
import { categorizedRegistry as designRegistry } from '../design/registry'

interface BaseEntry {
  id: string
  label: string
  category: string
  description?: string
  keywords?: string[]
}

export interface NavEntry extends BaseEntry {
  kind: 'navigate'
  path: string
}

export interface ActionEntry extends BaseEntry {
  kind: 'action'
  perform: () => void | Promise<void>
}

export type PaletteEntry = NavEntry | ActionEntry

function buildPages(): NavEntry[] {
  const pages: NavEntry[] = [
    { kind: 'navigate', id: 'home', label: 'Home', category: 'Components', path: '/' },
    {
      kind: 'navigate',
      id: 'design-home',
      label: 'Design Home',
      category: 'Design',
      path: '/design',
    },
  ]

  for (const entry of componentRegistry) {
    pages.push({
      kind: 'navigate',
      id: `component:${entry.category}:${entry.name}`,
      label: entry.name,
      category: entry.category,
      path: `/${entry.category.toLowerCase()}/${entry.name}`,
    })
  }

  for (const [category, entries] of Object.entries(designRegistry)) {
    for (const entry of entries) {
      pages.push({
        kind: 'navigate',
        id: `design:${category}:${entry.name}`,
        label: entry.name,
        category: `Design / ${category}`,
        path: entry.path,
        description: entry.description,
      })
    }
  }

  return pages
}

export const PAGES: NavEntry[] = buildPages()

const MAX_RESULTS = 50

export function searchEntries(entries: PaletteEntry[], query: string): PaletteEntry[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const prefixMatches: PaletteEntry[] = []
  const labelMatches: PaletteEntry[] = []
  const otherMatches: PaletteEntry[] = []

  for (const entry of entries) {
    const label = entry.label.toLowerCase()
    if (label.startsWith(trimmed)) {
      prefixMatches.push(entry)
      continue
    }
    if (label.includes(trimmed)) {
      labelMatches.push(entry)
      continue
    }
    const keywords = entry.keywords?.join(' ') ?? ''
    const haystack = `${entry.category} ${entry.description ?? ''} ${keywords}`.toLowerCase()
    if (haystack.includes(trimmed)) {
      otherMatches.push(entry)
    }
  }

  return [...prefixMatches, ...labelMatches, ...otherMatches].slice(0, MAX_RESULTS)
}
