import type {
  BreadcrumbNode,
  BreadcrumbNodes,
  BreadcrumbTrail,
  FlowBreadcrumb,
} from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

/**
 * Builds a complete breadcrumb trail map from a hierarchical node structure.
 *
 * Takes a tree structure of breadcrumb nodes and generates a map where each state
 * has its complete breadcrumb trail from root to that state. This is useful for
 * initializing breadcrumb navigation in state machines or multi-step flows.
 */
export const buildBreadcrumbs = (nodes: BreadcrumbNodes): BreadcrumbTrail => {
  const map: Record<string, FlowBreadcrumb[]> = {}

  for (const [state, node] of Object.entries(nodes)) {
    const trail: FlowBreadcrumb[] = []
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

/**
 * Resolves template variables in breadcrumb labels using values from a context object.
 *
 * Supports Handlebars-style template syntax ({{variableName}}) for dynamic breadcrumb labels.
 * Variables enclosed in double braces are replaced with their corresponding values from the context.
 * Non-template strings are returned as-is.
 */
export const resolveBreadcrumbVariables = (
  variables: Record<string, string> | undefined,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  if (!variables) {
    return {}
  }

  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(variables)) {
    const match = value.match(/{{(.*?)}}/)
    if (match?.[1]) {
      const ctxKey = match[1].trim()
      resolved[key] = context[ctxKey] ?? ''
    } else {
      resolved[key] = value
    }
  }
  return resolved
}

/**
 * Marks a breadcrumb as non-navigable across all trails in the context.
 * Use this in state machine reducers to disable backward navigation to a specific step.
 */
export const lockBreadcrumb = <T extends { breadcrumbs?: BreadcrumbTrail }>(
  breadcrumbId: string,
  context: T,
): T => {
  const allBreadcrumbs = context.breadcrumbs ?? {}
  const updatedBreadcrumbs = Object.fromEntries(
    Object.entries(allBreadcrumbs).map(([stateKey, trail]) => [
      stateKey,
      trail.map(b => (b.id === breadcrumbId ? { ...b, isNavigable: false } : b)),
    ]),
  )
  return { ...context, breadcrumbs: updatedBreadcrumbs }
}

/**
 * Updates the breadcrumb trail for a specific state with resolved variables.
 *
 * This function is typically used in state machine transitions to update breadcrumb
 * navigation when moving between states. It preserves all existing breadcrumb trails
 * for other states and only updates the trail for the specified state by resolving
 * any template variables for that state's breadcrumb.

 */
export const updateBreadcrumbs = <
  T extends { breadcrumbs?: BreadcrumbTrail; currentBreadcrumb?: string },
>(
  stateName: string,
  context: T,
  variables?: Record<string, string>,
): Omit<T, 'breadcrumbs' | 'currentBreadcrumb'> & {
  breadcrumbs: BreadcrumbTrail
  currentBreadcrumbId: string
} => {
  const allBreadcrumbs = context.breadcrumbs ?? {}
  const trail = allBreadcrumbs[stateName] ?? []
  const resolvedTrail = trail.map(breadcrumb => {
    return {
      ...breadcrumb,
      variables: resolveBreadcrumbVariables(variables, context as Record<string, unknown>),
    }
  })
  return {
    ...context,
    breadcrumbs: {
      ...allBreadcrumbs,
      [stateName]: resolvedTrail,
    },
    currentBreadcrumbId: stateName,
  }
}
