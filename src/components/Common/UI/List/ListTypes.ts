import type { HTMLAttributes, ReactNode } from 'react'

// Base list props without HTML element specific attributes
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

// UnorderedList specific props with HTMLUListElement attributes
export interface UnorderedListProps extends BaseListProps, HTMLAttributes<HTMLUListElement> {
  // Any unordered list specific props would go here
}

// OrderedList specific props with HTMLOListElement attributes
export interface OrderedListProps extends BaseListProps, HTMLAttributes<HTMLOListElement> {
  // Any ordered list specific props would go here
}
