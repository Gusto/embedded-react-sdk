import type { ReactElement } from 'react'

/** @internal */
export interface ReorderableListItem {
  /** Rendered content displayed inside the reorderable row. */
  content: ReactElement
  /** Accessible name announced for the item by screen readers. */
  label: string
  /** Stable identifier used as a React key; falls back to the item's index when omitted. */
  id?: string
}
