import { EmptyStateFromConfig } from './EmptyStateFromConfig'
import type { EmptyStateConfig } from './useDataView'

export function resolveEmptyState(
  emptyState: EmptyStateConfig | (() => React.ReactNode) | undefined,
): (() => React.ReactNode) | undefined {
  if (!emptyState) return undefined
  if (typeof emptyState === 'function') return emptyState
  const config = emptyState
  return function renderEmptyState() {
    return <EmptyStateFromConfig config={config} />
  }
}
