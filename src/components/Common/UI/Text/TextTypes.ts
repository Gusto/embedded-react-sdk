import type { HTMLAttributes, ReactNode } from 'react'

export interface TextProps extends Pick<HTMLAttributes<HTMLParagraphElement>, 'className' | 'id'> {
  /**
   * HTML element to render the text as
   */
  as?: 'p' | 'span' | 'div' | 'pre'
  /**
   * Size variant of the text
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Text alignment within the container
   */
  textAlign?: 'start' | 'center' | 'end'
  /**
   * Font weight of the text
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  /**
   * Content to be displayed
   */
  children?: ReactNode
  /**
   * Visual style variant of the text
   */
  variant?: 'supporting'
}
