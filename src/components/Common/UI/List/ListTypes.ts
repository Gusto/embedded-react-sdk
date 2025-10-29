import type { ReactNode } from 'react'

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

export type UnorderedListProps = BaseListProps

export type OrderedListProps = BaseListProps

export const UnorderedListDefaults = {} as const satisfies Partial<UnorderedListProps>

export const OrderedListDefaults = {} as const satisfies Partial<OrderedListProps>
