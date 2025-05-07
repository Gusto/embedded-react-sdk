import type { ReactElement } from 'react'

/**
 * Interface for a reorderable list item
 */
export interface ReorderableListItem {
  /**
   * The React element to render
   */
  content: ReactElement

  /**
   * Accessible label for screen readers
   */
  label: string
}

/**
 * Properties for the ReorderableList component
 */
export interface ReorderableListProps {
  /**
   * Array of reorderable items with their content and labels
   */
  items: ReorderableListItem[]

  /**
   * Accessible label for the list
   */
  label: string

  /**
   * Callback when items are reordered
   */
  onReorder?: (itemOrder: number[]) => void

  /**
   * Additional class name
   */
  className?: string
}

/**
 * Properties for an individual reorderable item
 */
export interface ReorderableItemProps {
  /**
   * The item data containing both content and label
   */
  item: ReorderableListItem

  /**
   * Index of the item in the list
   */
  index: number

  /**
   * Function to move an item from one position to another
   */
  moveItem: (fromIndex: number, toIndex: number, source?: 'keyboard' | 'dragdrop') => void

  /**
   * Total number of items in the list
   */
  itemCount: number
}
