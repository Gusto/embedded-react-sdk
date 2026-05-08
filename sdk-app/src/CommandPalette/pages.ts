import { componentRegistry } from '../registry'
import { categorizedRegistry as designRegistry } from '../design/registry'

export interface PageEntry {
  id: string
  label: string
  category: string
  path: string
  description?: string
}

function buildPages(): PageEntry[] {
  const pages: PageEntry[] = [
    { id: 'home', label: 'Home', category: 'Components', path: '/' },
    { id: 'design-home', label: 'Design Home', category: 'Design', path: '/design' },
  ]

  for (const entry of componentRegistry) {
    pages.push({
      id: `component:${entry.category}:${entry.name}`,
      label: entry.name,
      category: entry.category,
      path: `/${entry.category.toLowerCase()}/${entry.name}`,
    })
  }

  for (const [category, entries] of Object.entries(designRegistry)) {
    for (const entry of entries) {
      pages.push({
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

export const PAGES: PageEntry[] = buildPages()

const MAX_RESULTS = 50

export function searchPages(query: string): PageEntry[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const prefixMatches: PageEntry[] = []
  const labelMatches: PageEntry[] = []
  const otherMatches: PageEntry[] = []

  for (const page of PAGES) {
    const label = page.label.toLowerCase()
    if (label.startsWith(trimmed)) {
      prefixMatches.push(page)
      continue
    }
    if (label.includes(trimmed)) {
      labelMatches.push(page)
      continue
    }
    const haystack = `${page.category} ${page.description ?? ''}`.toLowerCase()
    if (haystack.includes(trimmed)) {
      otherMatches.push(page)
    }
  }

  return [...prefixMatches, ...labelMatches, ...otherMatches].slice(0, MAX_RESULTS)
}
