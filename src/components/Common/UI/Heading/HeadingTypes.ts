import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Props your `Heading` implementation must accept from the component adapter.
 * Renders an HTML heading (`<h1>`–`<h6>`) whose visual style level is controlled independently from its semantic level.
 *
 * @public
 * @group Component props
 */
export interface HeadingProps extends Pick<HTMLAttributes<HTMLHeadingElement>, 'className' | 'id'> {
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
