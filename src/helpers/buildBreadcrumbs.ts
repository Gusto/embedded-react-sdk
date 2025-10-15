import type {
  BreadcrumbStep,
  BreadcrumbNodes,
  BreadcrumbNode,
} from '@/components/Common/UI/ProgressBreadcrumbs/ProgressBreadcrumbsTypes'

export const buildBreadcrumbs = (nodes: BreadcrumbNodes) => {
  const map: Record<string, BreadcrumbStep[]> = {}

  for (const [state, node] of Object.entries(nodes)) {
    const trail: BreadcrumbStep[] = []
    let current: BreadcrumbNode | null = node

    while (current) {
      trail.unshift(current.item)
      const parentKey: string | null = current.parent
      current = parentKey ? (nodes[parentKey] ?? null) : null
    }

    map[state] = trail
  }

  return map
}
