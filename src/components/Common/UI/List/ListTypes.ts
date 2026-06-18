import type { ReactNode } from 'react'

/**
 * Shared props accepted by both `OrderedList` and `UnorderedList` implementations.
 *
 * @public
 * @group Utility Types
 */
export interface BaseListProps {
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

/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Props your `UnorderedList` implementation must accept from the component adapter.
 * Renders an unordered (bulleted) list of items.
 *
 * @public
 * @group Component Props
 */
export interface UnorderedListProps extends BaseListProps {}

/**
 * Props your `OrderedList` implementation must accept from the component adapter.
 * Renders an ordered (numbered) list of items.
 *
 * @public
 * @group Component Props
 */
export interface OrderedListProps extends BaseListProps {}
/* eslint-enable @typescript-eslint/no-empty-object-type */
