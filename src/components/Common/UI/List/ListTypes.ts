import type { ReactNode } from 'react'

// Base list props without HTML element specific attributes
interface BaseListProps {
  /**
   * The list items to render
   */
  items: ReactNode[]

  /**
   * Optional custom class name
   */
  className?: string

  /**
   * Accessibility label for the list
   */
  'aria-label'?: string

  /**
   * ID of an element that labels this list
   */
  'aria-labelledby'?: string

  /**
   * ID of an element that describes this list
   */
  'aria-describedby'?: string
}

/**
 * Props your `UnorderedList` implementation must accept from the component adapter.
 * Renders an unordered (bulleted) list of items.
 *
 * @public
 */
export type UnorderedListProps = BaseListProps

/**
 * Props your `OrderedList` implementation must accept from the component adapter.
 * Renders an ordered (numbered) list of items.
 *
 * @public
 */
export type OrderedListProps = BaseListProps
