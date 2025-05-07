import type { ReactElement } from 'react'

/**
 * Interface for a reorderable list item
 */
export interface ReorderableListItem {
  /**
   * The React element to render as the item's content
   */
  content: ReactElement

  /**
   * Accessible label for screen readers and announcements
   */
  label: string

  /**
   * Optional unique identifier for the item
   * If not provided, the index will be used
   */
  id?: string
}

/**
 * Configuration for animations in the ReorderableList
 */
export interface ReorderableListAnimationConfig {
  /**
   * Duration of the reorder animation in milliseconds
   * @default 200
   */
  duration?: number

  /**
   * The CSS easing function to use for the animation
   * @default 'ease-in-out'
   */
  easing?: string

  /**
   * Whether to disable animations entirely
   * @default false
   */
  disabled?: boolean
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
   * Accessible label for the list (used for aria-label)
   */
  label: string

  /**
   * Callback when items are reordered
   * @param itemOrder - Array of indices representing the new order
   */
  onReorder?: (itemOrder: number[]) => void

  /**
   * Additional class name for styling
   */
  className?: string

  /**
   * Animation configuration for drag and drop
   */
  animationConfig?: ReorderableListAnimationConfig

  /**
   * Whether to disable the reordering functionality
   * @default false
   */
  disabled?: boolean

  /**
   * Custom rendering for the drag handle
   * Accepts a function that returns a React element
   */
  renderDragHandle?: (props: {
    id: string | number
    label: string
    isReordering: boolean
    isDragging: boolean
  }) => ReactElement

  /**
   * Custom CSS class for the drop zones
   */
  dropZoneClassName?: string

  /**
   * Custom CSS class for the list items
   */
  itemClassName?: string
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
   * Current position of the item in the list
   */
  index: number

  /**
   * Function to move an item from one position to another
   * @param fromIndex - Current position of the item
   * @param toIndex - Target position for the item
   * @param source - Whether the reordering is from keyboard or drag-and-drop
   */
  moveItem: (fromIndex: number, toIndex: number, source?: 'keyboard' | 'dragdrop') => void

  /**
   * Total number of items in the list
   */
  itemCount: number

  /**
   * Original index of the item in the items array
   */
  itemIndex: number

  /**
   * ID of the parent list
   */
  listId: string

  /**
   * Whether any item is currently being dragged
   */
  isDraggingAny: boolean

  /**
   * Function to update the dragging state
   */
  setIsDragging: (isDragging: boolean) => void

  /**
   * Whether the drag and drop is fully initialized
   */
  isInitialized: boolean

  /**
   * Whether any item is in reordering mode via keyboard
   */
  isReorderingActive: boolean

  /**
   * Function to update the reordering state
   */
  setIsReorderingActive: (isReorderingActive: boolean) => void

  /**
   * Whether this specific item is currently being reordered
   */
  isCurrentlyReordering: boolean

  /**
   * Function to update which item is being reordered
   */
  setReorderingItemIndex: (reorderingItemIndex: number | null) => void

  /**
   * Optional custom renderer for the drag handle
   */
  renderDragHandle?: (props: {
    id: string | number
    label: string
    isReordering: boolean
    isDragging: boolean
  }) => ReactElement

  /**
   * Optional CSS class to apply to the item
   */
  className?: string
}
