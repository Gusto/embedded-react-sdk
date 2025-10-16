import type {
  Breadcrumb,
  BreadcrumbNodes,
  BreadcrumbNode,
  BreadcrumbTrail,
} from '@/components/Common/UI/ProgressBreadcrumbs/ProgressBreadcrumbsTypes'

/**
 * Builds a complete breadcrumb trail map from a hierarchical node structure.
 *
 * Takes a tree structure of breadcrumb nodes and generates a map where each state
 * has its complete breadcrumb trail from root to that state. This is useful for
 * initializing breadcrumb navigation in state machines or multi-step flows.
 *
 * @param nodes - A record of breadcrumb nodes with parent-child relationships
 * @returns A trail map where each key has an array of breadcrumb steps from root to that state
 *
 * @example
 * ```ts
 * const nodes = {
 *   list: { parent: null, item: { key: 'list', label: 'List' } },
 *   detail: { parent: 'list', item: { key: 'detail', label: 'Detail' } }
 * }
 * const trails = buildBreadcrumbs(nodes)
 * // Result: {
 * //   list: [{ key: 'list', label: 'List' }],
 * //   detail: [{ key: 'list', label: 'List' }, { key: 'detail', label: 'Detail' }]
 * // }
 * ```
 */
export const buildBreadcrumbs = (nodes: BreadcrumbNodes): BreadcrumbTrail => {
  const map: Record<string, Breadcrumb[]> = {}

  for (const [state, node] of Object.entries(nodes)) {
    const trail: Breadcrumb[] = []
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
 *
 * @param variables - Object with variable names as keys and template strings or literal values
 * @param context - Context object containing values to substitute into templates
 * @returns Resolved variables with template strings replaced by context values
 *
 * @example
 * ```ts
 * const variables = { firstName: '{{firstName}}', lastName: '{{lastName}}' }
 * const context = { firstName: 'John', lastName: 'Doe' }
 * const resolved = resolveBreadcrumbVariables(variables, context)
 * // Result: { firstName: 'John', lastName: 'Doe' }
 * ```
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
 * Updates the breadcrumb trail for a specific state with resolved variables.
 *
 * This function is typically used in state machine transitions to update breadcrumb
 * navigation when moving between states. It preserves all existing breadcrumb trails
 * for other states and only updates the trail for the specified state by resolving
 * any template variables for that state's breadcrumb.
 *
 * @param stateName - The state key to update breadcrumbs for
 * @param context - Context object containing current breadcrumbs and values for variable resolution
 * @param variables - Optional template variables to resolve for the current state breadcrumb
 * @returns Updated context with resolved breadcrumbs and current breadcrumb set to stateName
 *
 * @example
 * ```ts
 * const context = {
 *   firstName: 'Jane',
 *   breadcrumbs: {
 *     list: [{ key: 'list', label: 'List' }],
 *     edit: [{ key: 'list', label: 'List' }, { key: 'edit', label: 'Edit' }]
 *   }
 * }
 * const updated = updateBreadcrumbs('edit', context, { firstName: '{{firstName}}' })
 * // Result includes breadcrumb with variables: { firstName: 'Jane' }
 * ```
 */
export const updateBreadcrumbs = <
  T extends { breadcrumbs?: BreadcrumbTrail; currentBreadcrumb?: string },
>(
  stateName: string,
  context: T,
  variables?: Record<string, string>,
): Omit<T, 'breadcrumbs' | 'currentBreadcrumb'> & {
  breadcrumbs: BreadcrumbTrail
  currentBreadcrumb: string
} => {
  const allBreadcrumbs = context.breadcrumbs ?? {}
  const trail = allBreadcrumbs[stateName] ?? []
  const resolvedTrail = trail.map(breadcrumb => {
    if (breadcrumb.key === stateName && variables) {
      return {
        ...breadcrumb,
        variables: resolveBreadcrumbVariables(variables, context as Record<string, unknown>),
      }
    }
    return breadcrumb
  })
  return {
    ...context,
    breadcrumbs: {
      ...allBreadcrumbs,
      [stateName]: resolvedTrail,
    },
    currentBreadcrumb: stateName,
  }
}
