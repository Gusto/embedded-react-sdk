import type {
  BreadcrumbNode,
  BreadcrumbNodes,
  BreadcrumbTrail,
  FlowBreadcrumb,
} from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

type BreadcrumbsHeader = Extract<FlowHeaderConfig, { indicator: 'breadcrumbs' }>

type WithHeader = { header?: FlowHeaderConfig | null }

/**
 * Returns the existing breadcrumbs header from a context, defaulting to a
 * blank breadcrumbs config when the header is missing or of a different
 * variant. Helpers below use this so callers don't need to manually narrow
 * the discriminated `header` union before mutating breadcrumb data.
 */
const getBreadcrumbsHeader = (header: FlowHeaderConfig | null | undefined): BreadcrumbsHeader => {
  if (header?.indicator === 'breadcrumbs') return header
  return { indicator: 'breadcrumbs' }
}

/**
 * Builds a complete breadcrumb trail map from a hierarchical node structure.
 *
 * @remarks Walks each node's `parent` pointer to assemble a root-to-state trail, producing
 * one entry per state. Use it to seed breadcrumb navigation when initializing a state
 * machine or multi-step flow.
 *
 * @param nodes - Map of state names to breadcrumb nodes, each carrying an `item` and an
 * optional `parent` state key.
 * @returns A map from state name to its ordered breadcrumb trail.
 * @internal
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
 * @remarks Supports Handlebars-style `{{variableName}}` syntax. Values enclosed in double
 * braces are replaced with the corresponding key on `context`; missing keys resolve to an
 * empty string. Strings without a template token are returned unchanged.
 *
 * @param variables - Map of variable names to either a literal or a `{{key}}` template.
 * Pass `undefined` to skip resolution.
 * @param context - Source values referenced by template tokens.
 * @returns A map of variable names to resolved values, or an empty object when `variables`
 * is `undefined`.
 * @internal
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
 * Merges `patch` fields into the existing breadcrumbs header on a context.
 *
 * @remarks Preserves existing trails and CTA; if the context has no breadcrumbs header
 * a fresh one is created. Use this when a transition needs to flip breadcrumb visibility
 * (for example `currentBreadcrumbId`) without rebuilding any trails.
 *
 * @typeParam T - Context shape carrying an optional `header` of the discriminated union.
 * @param context - The context whose breadcrumbs header should be patched.
 * @param patch - Partial breadcrumbs-header fields to merge in. The `indicator` discriminator
 * cannot be overridden.
 * @returns A new context with the patched breadcrumbs header.
 * @internal
 */
export const patchBreadcrumbsHeader = <T extends WithHeader>(
  context: T,
  patch: Partial<Omit<BreadcrumbsHeader, 'indicator'>>,
): T & { header: BreadcrumbsHeader } => {
  const existing = getBreadcrumbsHeader(context.header)
  return { ...context, header: { ...existing, ...patch } }
}

/**
 * Removes a breadcrumb from every trail in the context's breadcrumbs header.
 *
 * @remarks Use in state machine reducers to hide a step entirely, for example after
 * payroll submission when the step should no longer appear in any trail.
 *
 * @typeParam T - Context shape carrying an optional `header` of the discriminated union.
 * @param breadcrumbId - Id of the breadcrumb to strip from every trail.
 * @param context - The context whose breadcrumbs header should be updated.
 * @returns A new context with the breadcrumb removed from all trails.
 * @internal
 */
export const hideBreadcrumb = <T extends WithHeader>(breadcrumbId: string, context: T): T => {
  const breadcrumbsHeader = getBreadcrumbsHeader(context.header)
  const allBreadcrumbs = breadcrumbsHeader.breadcrumbs ?? {}
  const updatedBreadcrumbs = Object.fromEntries(
    Object.entries(allBreadcrumbs).map(([stateKey, trail]) => [
      stateKey,
      trail.filter(b => b.id !== breadcrumbId),
    ]),
  )
  return {
    ...context,
    header: { ...breadcrumbsHeader, breadcrumbs: updatedBreadcrumbs },
  }
}

/**
 * Marks a breadcrumb as non-navigable across every trail in the context's breadcrumbs header.
 *
 * @remarks Use in state machine reducers to disable backward navigation to a specific step
 * while still showing it in the trail.
 *
 * @typeParam T - Context shape carrying an optional `header` of the discriminated union.
 * @param breadcrumbId - Id of the breadcrumb to mark `isNavigable: false`.
 * @param context - The context whose breadcrumbs header should be updated.
 * @returns A new context with the breadcrumb locked in every trail.
 * @internal
 */
export const lockBreadcrumb = <T extends WithHeader>(breadcrumbId: string, context: T): T => {
  const breadcrumbsHeader = getBreadcrumbsHeader(context.header)
  const allBreadcrumbs = breadcrumbsHeader.breadcrumbs ?? {}
  const updatedBreadcrumbs = Object.fromEntries(
    Object.entries(allBreadcrumbs).map(([stateKey, trail]) => [
      stateKey,
      trail.map(b => (b.id === breadcrumbId ? { ...b, isNavigable: false } : b)),
    ]),
  )
  return {
    ...context,
    header: { ...breadcrumbsHeader, breadcrumbs: updatedBreadcrumbs },
  }
}

/**
 * Updates the breadcrumb trail for a specific state with resolved variables and switches
 * the active breadcrumb to that state.
 *
 * @remarks Typically called from state machine transitions to update breadcrumb navigation
 * when moving between states. Existing trails for other states are preserved; only the trail
 * for `stateName` is rewritten with `variables` resolved against the context. The resulting
 * context's header is always a `'breadcrumbs'` indicator.
 *
 * @typeParam T - Context shape carrying an optional `header` of the discriminated union.
 * @param stateName - The state whose breadcrumb trail should be updated and made active.
 * @param context - The context whose breadcrumbs header should be updated.
 * @param variables - Optional template variables to resolve against the context for each
 * breadcrumb in the target state's trail.
 * @returns A new context with the trail for `stateName` updated and `currentBreadcrumbId`
 * set to `stateName`.
 * @internal
 */
export const updateBreadcrumbs = <T extends WithHeader>(
  stateName: string,
  context: T,
  variables?: Record<string, string>,
): T & { header: BreadcrumbsHeader } => {
  const breadcrumbsHeader = getBreadcrumbsHeader(context.header)
  const allBreadcrumbs = breadcrumbsHeader.breadcrumbs ?? {}
  const trail = allBreadcrumbs[stateName] ?? []
  const resolvedTrail = trail.map(breadcrumb => ({
    ...breadcrumb,
    variables: resolveBreadcrumbVariables(variables, context as Record<string, unknown>),
  }))
  return {
    ...context,
    header: {
      ...breadcrumbsHeader,
      breadcrumbs: {
        ...allBreadcrumbs,
        [stateName]: resolvedTrail,
      },
      currentBreadcrumbId: stateName,
    },
  }
}
