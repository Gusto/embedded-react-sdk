import type { HTMLAttributes, ReactNode } from 'react'

export interface HeadingProps extends Pick<HTMLAttributes<HTMLHeadingElement>, 'className'> {
  /**
   * The HTML heading element to render (h1-h6)
   */
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Optional visual style to apply, independent of the semantic heading level
   */
  styledAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Text alignment within the heading
   */
  textAlign?: 'start' | 'center' | 'end'
  /**
   * Content to be displayed inside the heading
   */
  children?: ReactNode
}
