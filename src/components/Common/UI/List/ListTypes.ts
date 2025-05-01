import type { HTMLAttributes, ReactNode } from 'react'

export type ListVariant = 'ordered' | 'unordered'

export interface ListProps
  extends Omit<HTMLAttributes<HTMLUListElement | HTMLOListElement>, 'children'> {
  /**
   * The type of list to render - ordered (ol) or unordered (ul)
   * @default 'unordered'
   */
  variant?: ListVariant

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

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Content of the list item
   */
  children: ReactNode
}
