/**
 * Hook Return Shape Standard
 *
 * Every exported useXxx hook follows this grouped return shape:
 *
 * - data       - Domain data the UI needs to render (entities, computed values, config)
 * - actions    - All callable functions (submit, edit, cancel, delete, etc.)
 * - meta       - Status indicators (isPending, isLoading, mode, alerts, errors)
 * - pagination - Optional. Only present on blocks with paginated data.
 * - form       - Optional. Only present on blocks with react-hook-form integration.
 */

export interface HookMeta {
  isPending: boolean
  isLoading?: boolean
}
