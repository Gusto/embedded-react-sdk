import Fuse from 'fuse.js'
import { componentRegistry } from '../registry'
import { categorizedRegistry as designRegistry } from '../design/registry'
import { componentMetadata } from './componentMetadata'

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
    {
      kind: 'navigate',
      id: 'api-explorer',
      label: 'API Explorer',
      category: 'Tools',
      path: '/tools/api-explorer',
      description: 'Send arbitrary requests through the dev proxy and inspect the response',
      keywords: ['raw', 'request', 'undocumented', 'curl', 'fetch'],
    },
    {
      kind: 'navigate',
      id: 'pay-period-shifts',
      label: 'Pay Period Shifts',
      category: 'Tools',
      path: '/tools/pay-period-shifts',
      description: 'Walk the query chain for fetching all shifts in a pay schedule’s pay period',
      keywords: ['time_sheets', 'time tracking', 'pay period', 'pay schedule', 'shifts'],
    },
    {
      kind: 'navigate',
      id: 'time-tracking-review',
      label: 'Time Tracking Review',
      category: 'Tools',
      path: '/tools/time-tracking-review',
      description:
        'The review-and-send prototype on real time sheets, read-only, with API gaps called out',
      keywords: ['time_sheets', 'time tracking', 'timesheets', 'payroll sync', 'gaps'],
    },
  ]

  for (const entry of componentRegistry) {
    const meta = componentMetadata[`${entry.category}.${entry.name}`]
    pages.push({
      kind: 'navigate',
      id: `component:${entry.category}:${entry.name}`,
      label: entry.name,
      category: entry.category,
      path: `/${entry.category.toLowerCase()}/${entry.name}`,
      ...(meta?.description ? { description: meta.description } : {}),
      ...(meta?.keywords ? { keywords: meta.keywords } : {}),
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

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<PaletteEntry>>[1] = {
  keys: [
    { name: 'label', weight: 0.5 },
    { name: 'keywords', weight: 0.3 },
    { name: 'description', weight: 0.15 },
    { name: 'category', weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
}

const fuseCache = new WeakMap<readonly PaletteEntry[], Fuse<PaletteEntry>>()

function getFuse(entries: readonly PaletteEntry[]): Fuse<PaletteEntry> {
  let fuse = fuseCache.get(entries)
  if (!fuse) {
    fuse = new Fuse([...entries], FUSE_OPTIONS)
    fuseCache.set(entries, fuse)
  }
  return fuse
}

export function searchEntries(entries: readonly PaletteEntry[], query: string): PaletteEntry[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  return getFuse(entries)
    .search(trimmed)
    .slice(0, MAX_RESULTS)
    .map((result: { item: PaletteEntry }) => result.item)
}
